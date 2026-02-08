/**
 * Capture PayPal Order API
 * POST /api/checkout/capture-order
 *
 * Called after customer approves payment in PayPal popup
 * 1. Captures the PayPal payment
 * 2. Updates order status to 'paid'
 * 3. Clears the customer's cart
 */

import type { APIRoute } from 'astro';
import { createServerSupabase } from '@/lib/supabase';
import { capturePayment } from '@/lib/payments';
import { sendEmail } from '@/lib/email';
import { orderConfirmationTemplate } from '@/lib/email-templates';

interface CaptureRequest {
  paypalOrderId: string;
  orderId: string;
}

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  try {
    const body: CaptureRequest = await request.json();
    const { paypalOrderId, orderId } = body;

    if (!paypalOrderId || !orderId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createServerSupabase(cookies);

    // Verify order exists and matches PayPal order ID
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('paypal_order_id', paypalOrderId)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if already captured
    if (order.payment_status === 'paid') {
      return new Response(JSON.stringify({
        success: true,
        message: 'Order already captured',
        orderId: order.id,
        orderNumber: order.order_number,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Capture payment via unified payments module
    const captureResult = await capturePayment('paypal', paypalOrderId);

    if (!captureResult.success) {
      console.error('Payment capture failed:', captureResult.error);

      // Update order with failure status
      await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          internal_note: `Capture failed: ${captureResult.error || 'Unknown'}`,
        })
        .eq('id', orderId);

      return new Response(JSON.stringify({
        error: 'Payment capture failed',
        details: captureResult.error,
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get capture details
    const captureId = captureResult.transactionId;
    const payerEmail = captureResult.payerEmail;

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'processing',
        payment_status: 'paid',
        paypal_capture_id: captureId,
        paid_at: new Date().toISOString(),
        ...(payerEmail && order.email !== payerEmail ? { internal_note: `PayPal email: ${payerEmail}` } : {}),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to update order:', updateError);
      return new Response(JSON.stringify({
        success: true,
        warning: 'Payment captured but order update failed',
        orderId: order.id,
        orderNumber: order.order_number,
        captureId: captureId,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Log payment to payments table
    await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        payment_method: 'paypal',
        transaction_id: captureId,
        amount: captureResult.amount ?? order.total,
        currency: captureResult.currency || 'USD',
        status: 'completed',
        direction: 'in',
        provider_response: captureResult.rawResponse,
      });

    // Clear customer's cart
    const visitorId = locals.visitorId;
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from('carts')
        .update({ items: [] })
        .eq('user_id', user.id);
    } else if (visitorId) {
      await supabase
        .from('carts')
        .update({ items: [] })
        .eq('visitor_id', visitorId);
    }

    // Increment coupon usage if order used a coupon
    if (order.coupon_code) {
      await supabase.rpc('increment_coupon_usage', { coupon_code_param: order.coupon_code });
    }

    // Send order confirmation email (fire-and-forget)
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('name, sku, variant, size, quantity, unit_price, line_total')
      .eq('order_id', orderId);

    sendEmail({
      to: order.email,
      subject: `Order Confirmed - ${order.order_number}`,
      html: orderConfirmationTemplate({
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
      }),
    }).catch(err => console.error('Failed to send confirmation email:', err));

    return new Response(JSON.stringify({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      paypalOrderId: paypalOrderId,
      captureId: captureId,
      total: order.total,
      email: order.email,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Capture error:', error);
    return new Response(JSON.stringify({
      error: 'Capture failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
