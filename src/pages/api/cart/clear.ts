/**
 * Clear Cart API Endpoint
 * POST /api/cart/clear - Clears all items from the cart
 */

import type { APIRoute } from 'astro';
import { createServerSupabase } from '@/lib/supabase';

export const prerender = false;

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

    // Clear cart items
    const { error } = await supabase
      .from('carts')
      .update({
        items: [],
        updated_at: new Date().toISOString(),
      })
      .eq('visitor_id', visitorId);

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true,
      items: [],
      visitorId,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Cart clear error:', error);
    return new Response(JSON.stringify({ error: 'Failed to clear cart' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
