/**
 * Admin Order Notification API
 * POST /api/admin/orders/[id]/notify
 *
 * Sends shipping notification email and updates order status
 */

import type { APIRoute } from 'astro';
import { createServerSupabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';
import { shippingNotificationTemplate } from '@/lib/email-templates';

export const POST: APIRoute = async ({ params, request, cookies }) => {
  try {
    const orderId = params.id;
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Missing order ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { type, trackingNumber, trackingUrl } = body;

    if (type !== 'shipping') {
      return new Response(JSON.stringify({ error: 'Unsupported notification type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createServerSupabase(cookies);

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: adminCheck } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!adminCheck) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch order items
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('name, sku, variant, size, quantity, unit_price, line_total')
      .eq('order_id', orderId);

    // Send shipping notification email
    const emailResult = await sendEmail({
      to: order.email,
      subject: `Your Order #${order.order_number} Has Shipped`,
      html: shippingNotificationTemplate({
        orderNumber: order.order_number,
        email: order.email,
        items: orderItems || [],
        subtotal: order.subtotal,
        discount: order.discount || 0,
        shipping_cost: order.shipping_cost || 0,
        tax: order.tax || 0,
        total: order.total,
        shippingAddress: order.shipping_address,
        coupon_code: order.coupon_code,
        trackingNumber,
        trackingUrl,
      }),
    });

    // Update order status to shipped
    await supabase
      .from('orders')
      .update({
        status: 'shipped',
        shipped_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    return new Response(JSON.stringify({
      success: true,
      emailSent: emailResult.success,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Notify error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to send notification',
      details: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
