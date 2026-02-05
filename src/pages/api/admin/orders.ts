/**
 * Admin Orders API
 * GET /api/admin/orders - List orders with filters
 *
 * Query params:
 * - page: Page number (default 1)
 * - limit: Items per page (default 20, max 100)
 * - status: Filter by order status
 * - payment_status: Filter by payment status
 * - search: Search by order number or email
 * - sort: Sort field (created_at, total, status)
 * - order: Sort order (asc, desc)
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

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createServerSupabase(cookies);

    // Check admin access
    if (!await isAdmin(supabase)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const status = url.searchParams.get('status');
    const paymentStatus = url.searchParams.get('payment_status');
    const search = url.searchParams.get('search');
    const sortField = url.searchParams.get('sort') || 'created_at';
    const sortOrder = url.searchParams.get('order') === 'asc';
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        email,
        status,
        payment_status,
        subtotal,
        shipping_cost,
        tax,
        discount,
        total,
        shipping_address,
        customer_note,
        internal_note,
        created_at,
        paid_at,
        shipped_at,
        paypal_order_id,
        paypal_capture_id
      `, { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus);
    }

    if (search) {
      query = query.or(`order_number.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply sorting
    const validSortFields = ['created_at', 'total', 'status', 'order_number'];
    const finalSortField = validSortFields.includes(sortField) ? sortField : 'created_at';
    query = query.order(finalSortField, { ascending: sortOrder });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: orders, error, count } = await query;

    if (error) {
      console.error('Failed to fetch orders:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch orders' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get order item counts for each order
    const orderIds = orders?.map(o => o.id) || [];
    const { data: itemCounts } = await supabase
      .from('order_items')
      .select('order_id')
      .in('order_id', orderIds);

    const itemCountMap: Record<string, number> = {};
    itemCounts?.forEach(item => {
      itemCountMap[item.order_id] = (itemCountMap[item.order_id] || 0) + 1;
    });

    // Add item count to orders
    const ordersWithCounts = orders?.map(order => ({
      ...order,
      item_count: itemCountMap[order.id] || 0,
    }));

    // Get summary stats
    const { data: stats } = await supabase
      .from('orders')
      .select('status, payment_status, total');

    const summary = {
      total_orders: stats?.length || 0,
      pending: stats?.filter(o => o.status === 'pending').length || 0,
      paid: stats?.filter(o => o.payment_status === 'paid').length || 0,
      shipped: stats?.filter(o => o.status === 'shipped').length || 0,
      total_revenue: stats?.filter(o => o.payment_status === 'paid')
        .reduce((sum, o) => sum + Number(o.total), 0) || 0,
    };

    return new Response(JSON.stringify({
      orders: ordersWithCounts || [],
      summary,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Admin orders error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
