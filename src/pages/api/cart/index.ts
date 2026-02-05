/**
 * Cart API Endpoint
 * Handles server-side cart operations with Supabase storage
 */

import type { APIRoute } from 'astro';
import { createServerSupabase, type CartItemDB } from '@/lib/supabase';

export const prerender = false;

/**
 * GET /api/cart - Get current cart items
 */
export const GET: APIRoute = async ({ locals, cookies }) => {
  const visitorId = locals.visitorId;

  if (!visitorId) {
    return new Response(JSON.stringify({ error: 'No visitor ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabase = createServerSupabase(cookies);

    const { data, error } = await supabase
      .from('carts')
      .select('items')
      .eq('visitor_id', visitorId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is fine for empty cart
      throw error;
    }

    return new Response(JSON.stringify({
      items: data?.items || [],
      visitorId,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Cart GET error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch cart' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * POST /api/cart - Add item to cart
 */
export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const visitorId = locals.visitorId;

  if (!visitorId) {
    return new Response(JSON.stringify({ error: 'No visitor ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const newItem: CartItemDB = await request.json();

    // Validate required fields
    if (!newItem.sku || !newItem.product_slug || !newItem.quantity) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createServerSupabase(cookies);

    // Get existing cart
    const { data: existingCart } = await supabase
      .from('carts')
      .select('id, items')
      .eq('visitor_id', visitorId)
      .single();

    let items: CartItemDB[] = existingCart?.items || [];

    // Check if item with same SKU already exists
    const existingIndex = items.findIndex(item => item.sku === newItem.sku);

    if (existingIndex >= 0) {
      // Update quantity of existing item
      items[existingIndex].quantity += newItem.quantity;
    } else {
      // Add new item
      items.push(newItem);
    }

    // Upsert cart
    const { error } = await supabase
      .from('carts')
      .upsert({
        visitor_id: visitorId,
        items,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'visitor_id',
      });

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true,
      items,
      visitorId,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Cart POST error:', error);
    return new Response(JSON.stringify({ error: 'Failed to add to cart' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * PUT /api/cart - Update item quantity
 */
export const PUT: APIRoute = async ({ request, locals, cookies }) => {
  const visitorId = locals.visitorId;

  if (!visitorId) {
    return new Response(JSON.stringify({ error: 'No visitor ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { sku, quantity } = await request.json();

    if (!sku || quantity === undefined) {
      return new Response(JSON.stringify({ error: 'Missing sku or quantity' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createServerSupabase(cookies);

    // Get existing cart
    const { data: existingCart, error: fetchError } = await supabase
      .from('carts')
      .select('items')
      .eq('visitor_id', visitorId)
      .single();

    if (fetchError) throw fetchError;

    let items: CartItemDB[] = existingCart?.items || [];

    // Find and update item
    const itemIndex = items.findIndex(item => item.sku === sku);

    if (itemIndex === -1) {
      return new Response(JSON.stringify({ error: 'Item not found in cart' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      items = items.filter(item => item.sku !== sku);
    } else {
      items[itemIndex].quantity = quantity;
    }

    // Update cart
    const { error } = await supabase
      .from('carts')
      .update({
        items,
        updated_at: new Date().toISOString(),
      })
      .eq('visitor_id', visitorId);

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true,
      items,
      visitorId,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Cart PUT error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update cart' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * DELETE /api/cart - Remove item from cart
 */
export const DELETE: APIRoute = async ({ request, locals, cookies }) => {
  const visitorId = locals.visitorId;

  if (!visitorId) {
    return new Response(JSON.stringify({ error: 'No visitor ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { sku } = await request.json();

    if (!sku) {
      return new Response(JSON.stringify({ error: 'Missing sku' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createServerSupabase(cookies);

    // Get existing cart
    const { data: existingCart, error: fetchError } = await supabase
      .from('carts')
      .select('items')
      .eq('visitor_id', visitorId)
      .single();

    if (fetchError) throw fetchError;

    let items: CartItemDB[] = existingCart?.items || [];

    // Remove item
    items = items.filter(item => item.sku !== sku);

    // Update cart
    const { error } = await supabase
      .from('carts')
      .update({
        items,
        updated_at: new Date().toISOString(),
      })
      .eq('visitor_id', visitorId);

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true,
      items,
      visitorId,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Cart DELETE error:', error);
    return new Response(JSON.stringify({ error: 'Failed to remove from cart' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
