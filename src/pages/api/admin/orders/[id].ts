/**
 * Admin Order Detail API
 * GET /api/admin/orders/[id] - Get order with items
 * PUT /api/admin/orders/[id] - Update order status
 */

import type { APIRoute } from 'astro';
import { createServerSupabase } from '@/lib/supabase';

// Helper to check if user is admin
async function isAdmin(supabase: ReturnType<typeof createServerSupabase>): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .single();

  return !!data;
}

export const GET: APIRoute = async ({ params, cookies }) => {
  try {
    const supabase = createServerSupabase(cookies);

    // Check admin access
    if (!await isAdmin(supabase)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Order ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);

    if (itemsError) {
      console.error('Failed to fetch order items:', itemsError);
    }

    return new Response(JSON.stringify({
      order: {
        ...order,
        items: items || [],
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Admin order detail error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  try {
    const supabase = createServerSupabase(cookies);

    // Check admin access
    if (!await isAdmin(supabase)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Order ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    // Allowed fields to update
    const allowedFields = [
      'status',
      'payment_status',
      'internal_note',
      'shipping_cost',
      'discount',
    ];

    // Build updates object
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // Validate status values
    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    const validPaymentStatuses = ['unpaid', 'paid', 'refunded', 'partial_refund'];

    if (updates.status && !validStatuses.includes(updates.status as string)) {
      return new Response(JSON.stringify({ error: 'Invalid status' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (updates.payment_status && !validPaymentStatuses.includes(updates.payment_status as string)) {
      return new Response(JSON.stringify({ error: 'Invalid payment status' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Set timestamps based on status changes
    if (updates.status === 'shipped') {
      updates.shipped_at = new Date().toISOString();
    }

    if (updates.payment_status === 'paid') {
      updates.paid_at = new Date().toISOString();
    }

    // Recalculate total if shipping_cost or discount changed
    if (updates.shipping_cost !== undefined || updates.discount !== undefined) {
      const { data: currentOrder } = await supabase
        .from('orders')
        .select('subtotal, shipping_cost, tax, discount')
        .eq('id', id)
        .single();

      if (currentOrder) {
        const subtotal = Number(currentOrder.subtotal);
        const shipping = Number(updates.shipping_cost ?? currentOrder.shipping_cost);
        const tax = Number(currentOrder.tax);
        const discount = Number(updates.discount ?? currentOrder.discount);

        updates.total = subtotal + shipping + tax - discount;
      }
    }

    if (Object.keys(updates).length === 0) {
      return new Response(JSON.stringify({ error: 'No valid fields to update' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update order
    const { data: order, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update order:', error);
      return new Response(JSON.stringify({ error: 'Failed to update order' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`Order ${order.order_number} updated:`, updates);

    return new Response(JSON.stringify({
      success: true,
      order,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Admin order update error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
