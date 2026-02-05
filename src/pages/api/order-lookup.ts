/**
 * Guest Order Lookup API
 * POST /api/order-lookup
 *
 * Allows guest (unauthenticated) users to look up their order
 * by order_number + email combination.
 * Returns a sanitized order summary (no internal notes).
 */

import type { APIRoute } from 'astro';
import { createServerSupabase } from '@/lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { order_number, email } = body;

    // Validate inputs
    if (!order_number || typeof order_number !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Order number is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Email address is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createServerSupabase(cookies);

    // Query order by order_number and email
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, email, status, payment_status, subtotal, shipping_cost, tax, discount, total, created_at, shipped_at')
      .eq('order_number', order_number.trim())
      .eq('email', email.trim().toLowerCase())
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'not_found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch order items
    const { data: items } = await supabase
      .from('order_items')
      .select('name, sku, variant, color, size, quantity, unit_price, line_total, image')
      .eq('order_id', order.id)
      .order('created_at', { ascending: true });

    // Return sanitized order data (no internal notes, no user_id, no paypal IDs)
    return new Response(
      JSON.stringify({
        order: {
          order_number: order.order_number,
          status: order.status,
          payment_status: order.payment_status,
          subtotal: order.subtotal,
          shipping_cost: order.shipping_cost,
          tax: order.tax,
          discount: order.discount,
          total: order.total,
          created_at: order.created_at,
          shipped_at: order.shipped_at,
        },
        items: items || [],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
