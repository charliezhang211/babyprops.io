/**
 * Cart Validation API Endpoint
 * POST /api/cart/validate - Validates cart prices against server-side product data
 *
 * This endpoint ensures prices haven't been tampered with on the client side
 * by recalculating all prices from the product content files.
 */

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { createServerSupabase, type CartItemDB } from '@/lib/supabase';

export const prerender = false;

interface ValidationResult {
  valid: boolean;
  items: ValidatedItem[];
  subtotal: number;
  errors: string[];
}

interface ValidatedItem extends CartItemDB {
  validated_unit_price: number;
  validated_total: number;
  price_discrepancy: boolean;
}

export const POST: APIRoute = async ({ locals, cookies }) => {
  const visitorId = locals.visitorId;

  if (!visitorId) {
    return new Response(JSON.stringify({ error: 'No visitor ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabase = createServerSupabase(cookies);

    // Get cart items
    const { data: cart, error: fetchError } = await supabase
      .from('carts')
      .select('items')
      .eq('visitor_id', visitorId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    const items: CartItemDB[] = cart?.items || [];

    if (items.length === 0) {
      return new Response(JSON.stringify({
        valid: true,
        items: [],
        subtotal: 0,
        errors: [],
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Load all products from content collection
    const products = await getCollection('products');

    const validatedItems: ValidatedItem[] = [];
    const errors: string[] = [];
    let subtotal = 0;

    for (const item of items) {
      // Find product by slug
      const product = products.find(p => p.data.slug === item.product_slug);

      if (!product) {
        errors.push(`Product not found: ${item.product_slug}`);
        continue;
      }

      // Calculate validated price from server-side data
      // Cast to any since product schema may have extended fields from commerce kit
      const productData = product.data as any;
      let validatedPrice = productData.price_base ?? productData.basePrice;

      // Parse SKU to get variant and size
      // SKU format: PREFIX-VARIANT-SIZE or PREFIX-VARIANT-COLOR-SIZE
      const skuParts = item.sku.split('-');
      // Use sku_prefix from product, or derive from slug (same logic as Configurator)
      const prefix = productData.sku_prefix || productData.slug.split('-')[0].toUpperCase();

      // Skip prefix, get remaining parts
      const skuRemainder = item.sku.replace(`${prefix}-`, '');

      // Find variant price modifier
      if (productData.variants && item.variant) {
        // Match by variant name (most reliable) or by SKU pattern
        const variant = productData.variants.find((v: any) => {
          // First try exact name match
          if (v.name === item.variant) return true;
          // Then try SKU-based match
          const variantSku = v.sku || v.id.toUpperCase();
          return skuRemainder.startsWith(variantSku);
        });

        if (variant) {
          validatedPrice += variant.price_mod || 0;

          // Check for sub-color price modifier (if applicable)
          if (variant.colors && item.color) {
            const _color = variant.colors.find((c: any) => c.name.toLowerCase() === item.color?.toLowerCase());
            // Colors don't have price_mod in current schema, but could be added
          }
        }
      }

      // Find size price modifier
      if (productData.sizes && item.size) {
        const size = productData.sizes.find((s: any) => {
          const sizeSku = s.sku || s.id.toUpperCase();
          return item.sku.includes(sizeSku);
        });

        if (size) {
          validatedPrice += size.price_mod || 0;
        }
      }

      // Add stripe price (if selected)
      if (item.stripe && productData.stripes) {
        const stripe = productData.stripes.find((s: any) => {
          const stripeSku = s.sku || s.id;
          return stripeSku === item.stripe?.id;
        });

        if (stripe) {
          validatedPrice += stripe.price;
        }
      }

      // Add addon prices
      if (item.addons && item.addons.length > 0 && productData.addons) {
        for (const addon of item.addons) {
          const productAddon = productData.addons.find((a: any) => {
            const addonSku = a.sku || a.id;
            return addonSku === addon.id;
          });

          if (productAddon) {
            validatedPrice += productAddon.price;
          }
        }
      }

      const validatedTotal = validatedPrice * item.quantity;
      const clientTotal = item.unit_price * item.quantity;
      const priceDiscrepancy = Math.abs(validatedPrice - item.unit_price) > 0.01;

      if (priceDiscrepancy) {
        errors.push(`Price mismatch for ${item.name}: client=${item.unit_price}, server=${validatedPrice}`);
      }

      validatedItems.push({
        ...item,
        validated_unit_price: validatedPrice,
        validated_total: validatedTotal,
        price_discrepancy: priceDiscrepancy,
      });

      subtotal += validatedTotal;
    }

    const result: ValidationResult = {
      valid: errors.length === 0,
      items: validatedItems,
      subtotal,
      errors,
    };

    // If there were price discrepancies, update cart with correct prices
    if (errors.length > 0) {
      const correctedItems = validatedItems.map(item => ({
        ...item,
        unit_price: item.validated_unit_price,
      }));

      // Remove validation-specific fields before saving
      const cleanItems: CartItemDB[] = correctedItems.map(({ validated_unit_price, validated_total, price_discrepancy, ...rest }) => rest);

      await supabase
        .from('carts')
        .update({
          items: cleanItems,
          updated_at: new Date().toISOString(),
        })
        .eq('visitor_id', visitorId);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Cart validation error:', error);
    return new Response(JSON.stringify({ error: 'Failed to validate cart' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
