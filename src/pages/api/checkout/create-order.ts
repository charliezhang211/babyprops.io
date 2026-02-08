/**
 * Create Checkout Order API
 * POST /api/checkout/create-order
 *
 * 1. Validates cart items and prices
 * 2. Creates order in Supabase with status 'pending'
 * 3. Creates order_items with price snapshot
 * 4. Calls PayPal to create payment order
 * 5. Returns PayPal order ID to client
 */

import type { APIRoute } from 'astro';
import { createServerSupabase, type CartItemDB } from '@/lib/supabase';
import { createPayment } from '@/lib/payments';
import { CURRENCY } from '@/config/site';
import { getCollection } from 'astro:content';

interface CheckoutRequest {
  items: CartItemDB[];
  shipping: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  couponCode?: string;
}

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  try {
    const body: CheckoutRequest = await request.json();
    const { items, shipping } = body;

    // Validate required fields
    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Cart is empty' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!shipping.email || !shipping.firstName || !shipping.address1) {
      return new Response(JSON.stringify({ error: 'Missing required shipping fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Load product data for price validation
    const products = await getCollection('products');
    const productMap = new Map(products.map(p => [p.data.slug, p.data]));

    // Validate and calculate prices
    const validatedItems: CartItemDB[] = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const product = productMap.get(item.product_slug);

      if (!product) {
        return new Response(JSON.stringify({
          error: `Product not found: ${item.product_slug}`,
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Find the variant price modifier
      let basePrice = product.basePrice;
      if (item.variant && product.variants) {
        const variant = product.variants.find(v => v.name === item.variant);
        if (variant?.price_mod) {
          basePrice += variant.price_mod;
        }
      }

      const validatedUnitPrice = basePrice;
      const lineTotal = validatedUnitPrice * item.quantity;

      validatedItems.push({
        ...item,
        unit_price: validatedUnitPrice,
      });

      calculatedSubtotal += lineTotal;
    }

    // Currently no shipping cost or tax
    const shippingCost = 0;
    const tax = 0;

    // Get visitor ID and user ID - moved here before coupon validation
    const visitorId = locals.visitorId || 'guest';
    const supabase = createServerSupabase(cookies);
    const { data: { user } } = await supabase.auth.getUser();

    // Validate and apply coupon if provided
    let discount = 0;
    let appliedCouponCode: string | null = null;

    if (body.couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', body.couponCode.toUpperCase().trim())
        .eq('is_active', true)
        .single();

      if (coupon
        && (!coupon.valid_to || new Date(coupon.valid_to) >= new Date())
        && (!coupon.valid_from || new Date(coupon.valid_from) <= new Date())
        && (!coupon.max_uses || coupon.used_count < coupon.max_uses)
        && calculatedSubtotal >= (coupon.min_order || 0)) {
        discount = coupon.type === 'percentage'
          ? Math.round(calculatedSubtotal * coupon.value / 100 * 100) / 100
          : Math.min(coupon.value, calculatedSubtotal);
        appliedCouponCode = coupon.code;
      }
    }

    const total = calculatedSubtotal + shippingCost + tax - discount;

    // Create shipping address snapshot
    const shippingAddressSnapshot = {
      full_name: `${shipping.firstName} ${shipping.lastName}`,
      email: shipping.email,
      phone: shipping.phone || null,
      address_line1: shipping.address1,
      address_line2: shipping.address2 || null,
      city: shipping.city,
      state: shipping.state,
      postal_code: shipping.postcode,
      country: shipping.country,
    };

    // Create order in Supabase (status: pending)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        visitor_id: visitorId,
        user_id: user?.id || null,
        email: shipping.email,
        shipping_address: shippingAddressSnapshot,
        subtotal: calculatedSubtotal,
        shipping_cost: shippingCost,
        tax: tax,
        discount: discount,
        coupon_code: appliedCouponCode,
        total: total,
        status: 'pending',
        payment_status: 'unpaid',
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Failed to create order:', orderError);
      return new Response(JSON.stringify({ error: 'Failed to create order' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create order items with price snapshot
    const orderItems = validatedItems.map(item => ({
      order_id: order.id,
      sku: item.sku,
      product_slug: item.product_slug,
      name: item.name,
      variant: item.variant || null,
      color: item.color || null,
      size: item.size || null,
      custom_texts: item.custom_texts || null,
      stripe: item.stripe || null,
      addons: item.addons || [],
      unit_price: item.unit_price,
      quantity: item.quantity,
      line_total: item.unit_price * item.quantity,
      image: item.image || null,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Failed to create order items:', itemsError);
      // Rollback: delete the order
      await supabase.from('orders').delete().eq('id', order.id);
      return new Response(JSON.stringify({ error: 'Failed to create order items' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create payment via unified payments module
    const paymentResult = await createPayment('paypal', {
      orderNumber: order.order_number,
      orderId: order.id,
      items: validatedItems.map(item => ({
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
      subtotal: calculatedSubtotal,
      shipping: shippingCost,
      tax: tax,
      discount: discount,
      total: total,
      currency: CURRENCY.code,
      shippingAddress: {
        fullName: `${shipping.firstName} ${shipping.lastName}`,
        addressLine1: shipping.address1,
        addressLine2: shipping.address2,
        city: shipping.city,
        state: shipping.state,
        postalCode: shipping.postcode,
        countryCode: shipping.country,
        email: shipping.email,
        phone: shipping.phone,
      },
    });

    if (paymentResult.success && paymentResult.externalPaymentId) {
      // Update order with PayPal order ID
      await supabase
        .from('orders')
        .update({ paypal_order_id: paymentResult.externalPaymentId })
        .eq('id', order.id);

      return new Response(JSON.stringify({
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
        paypalOrderId: paymentResult.externalPaymentId,
        total: total,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      console.error('Payment creation failed:', paymentResult.error);

      // Update order status to indicate payment failure
      await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          internal_note: `Payment error: ${paymentResult.error || 'Unknown'}`,
        })
        .eq('id', order.id);

      return new Response(JSON.stringify({
        error: 'Payment provider unavailable',
        orderId: order.id,
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(JSON.stringify({
      error: 'Checkout failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
