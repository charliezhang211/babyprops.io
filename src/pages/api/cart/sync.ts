/**
 * Cart Sync API Endpoint
 * Batch syncs entire cart in a single operation for performance
 */

import type { APIRoute } from 'astro';
import { createServerSupabase, type CartItemDB } from '@/lib/supabase';

export const prerender = false;

/**
 * POST /api/cart/sync - Batch sync entire cart
 * Replaces server cart with provided items in a single operation
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
    const { items } = await request.json();

    // Validate items array
    if (!Array.isArray(items)) {
      return new Response(JSON.stringify({ error: 'Items must be an array' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createServerSupabase(cookies);

    // Upsert entire cart in a single operation
    const { error } = await supabase
      .from('carts')
      .upsert({
        visitor_id: visitorId,
        items: items as CartItemDB[],
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'visitor_id',
      });

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true,
      itemCount: items.length,
      visitorId,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Cart sync error:', error);
    return new Response(JSON.stringify({ error: 'Failed to sync cart' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
