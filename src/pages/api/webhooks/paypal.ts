/**
 * PayPal Webhook Handler
 * POST /api/webhooks/paypal
 *
 * Handles async payment notifications from PayPal
 * This provides redundancy in case client-side capture fails
 */

import type { APIRoute } from 'astro';
import { createServerSupabase } from '@/lib/supabase';
import { verifyWebhookSignature } from '@/lib/paypal';

const PAYPAL_WEBHOOK_ID = import.meta.env.PAYPAL_WEBHOOK_ID;

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource_type: string;
  resource: {
    id: string;
    status: string;
    purchase_units?: Array<{
      payments?: {
        captures?: Array<{
          id: string;
          status: string;
          amount: { currency_code: string; value: string };
        }>;
      };
    }>;
    payer?: {
      email_address: string;
      payer_id: string;
    };
  };
  create_time: string;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.text();
    const headers: Record<string, string> = {};

    // Extract PayPal signature headers
    for (const [key, value] of request.headers.entries()) {
      headers[key.toLowerCase()] = value;
    }

    // Verify webhook signature (optional but recommended for production)
    if (PAYPAL_WEBHOOK_ID) {
      const isValid = await verifyWebhookSignature(headers, body, PAYPAL_WEBHOOK_ID);
      if (!isValid) {
        console.error('Invalid PayPal webhook signature');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const event: PayPalWebhookEvent = JSON.parse(body);
    const supabase = createServerSupabase(cookies);

    console.log('PayPal webhook received:', event.event_type, event.resource?.id);

    // Handle different event types
    switch (event.event_type) {
      case 'CHECKOUT.ORDER.APPROVED': {
        // Customer approved the order - usually handled client-side
        // This is a backup notification
        const orderId = event.resource.id;

        await supabase
          .from('orders')
          .update({
            internal_note: `PayPal order approved at ${event.create_time}`,
          })
          .eq('paypal_order_id', orderId);

        break;
      }

      case 'PAYMENT.CAPTURE.COMPLETED': {
        // Payment was captured successfully
        const captureId = event.resource.id;
        const paypalOrderId = event.resource.id; // For capture events, resource.id is the capture ID

        // Find order by capture ID or try to extract from parent
        const { data: order } = await supabase
          .from('orders')
          .select('*')
          .eq('paypal_capture_id', captureId)
          .single();

        if (order) {
          // Already captured via client-side, just log
          console.log('Payment already captured for order:', order.order_number);
        } else {
          // This might be a backup notification
          console.log('Capture notification received for capture:', captureId);
        }

        break;
      }

      case 'PAYMENT.CAPTURE.DENIED': {
        // Payment was denied
        const captureId = event.resource.id;

        const { data: order } = await supabase
          .from('orders')
          .select('*')
          .eq('paypal_capture_id', captureId)
          .single();

        if (order) {
          await supabase
            .from('orders')
            .update({
              status: 'payment_failed',
              payment_status: 'failed',
              internal_note: `Payment denied at ${event.create_time}`,
            })
            .eq('id', order.id);
        }

        break;
      }

      case 'PAYMENT.CAPTURE.REFUNDED': {
        // Payment was refunded
        const captureId = event.resource.id;

        const { data: order } = await supabase
          .from('orders')
          .select('*')
          .eq('paypal_capture_id', captureId)
          .single();

        if (order) {
          await supabase
            .from('orders')
            .update({
              status: 'refunded',
              payment_status: 'refunded',
              internal_note: `Refunded at ${event.create_time}`,
            })
            .eq('id', order.id);
        }

        break;
      }

      case 'CHECKOUT.ORDER.COMPLETED': {
        // Full order completed (payment captured)
        const paypalOrderId = event.resource.id;

        const { data: order } = await supabase
          .from('orders')
          .select('*')
          .eq('paypal_order_id', paypalOrderId)
          .single();

        if (order && order.payment_status !== 'paid') {
          // Backup: mark as paid if not already
          const capture = event.resource.purchase_units?.[0]?.payments?.captures?.[0];

          await supabase
            .from('orders')
            .update({
              status: 'processing',
              payment_status: 'paid',
              paypal_capture_id: capture?.id,
              paid_at: new Date().toISOString(),
              internal_note: `Webhook confirmed payment at ${event.create_time}`,
            })
            .eq('id', order.id);

          console.log('Order marked as paid via webhook:', order.order_number);
        }

        break;
      }

      default:
        console.log('Unhandled PayPal event type:', event.event_type);
    }

    // Always return 200 to acknowledge receipt
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    // Return 200 even on error to prevent PayPal from retrying
    // Log the error for investigation
    return new Response(JSON.stringify({
      received: true,
      error: 'Processing error logged',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
