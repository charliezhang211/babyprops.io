/**
 * Stripe Payment Provider
 * Implements PaymentProvider interface for Stripe Checkout
 *
 * To enable Stripe:
 * 1. npm install stripe
 * 2. Add STRIPE_SECRET_KEY and PUBLIC_STRIPE_PUBLISHABLE_KEY to .env
 * 3. Uncomment the implementation below
 */

import type {
  PaymentProvider,
  PaymentOrderData,
  CreatePaymentResult,
  CapturePaymentResult,
  RefundPaymentResult,
} from '../types';

// Environment config
const getConfig = () => ({
  secretKey: import.meta.env.STRIPE_SECRET_KEY,
  publishableKey: import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY,
  webhookSecret: import.meta.env.STRIPE_WEBHOOK_SECRET,
  siteUrl: import.meta.env.SITE_URL || 'http://localhost:4321',
});

class StripeProvider implements PaymentProvider {
  id = 'stripe' as const;

  isConfigured(): boolean {
    const config = getConfig();
    return !!(config.secretKey && config.publishableKey);
  }

  async createPayment(data: PaymentOrderData): Promise<CreatePaymentResult> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Stripe is not configured' };
    }

    // TODO: Implement Stripe Checkout Session creation
    // Example implementation:
    //
    // const stripe = new Stripe(getConfig().secretKey);
    //
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: data.items.map(item => ({
    //     price_data: {
    //       currency: data.currency.toLowerCase(),
    //       product_data: { name: item.name },
    //       unit_amount: Math.round(item.unit_price * 100),
    //     },
    //     quantity: item.quantity,
    //   })),
    //   mode: 'payment',
    //   success_url: `${getConfig().siteUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${getConfig().siteUrl}/checkout`,
    //   metadata: {
    //     order_id: data.orderId,
    //     order_number: data.orderNumber,
    //   },
    //   shipping_address_collection: {
    //     allowed_countries: ['US', 'CA', 'GB', 'AU'],
    //   },
    // });
    //
    // return {
    //   success: true,
    //   externalPaymentId: session.id,
    //   redirectUrl: session.url,
    //   clientToken: session.client_secret,
    // };

    return {
      success: false,
      error: 'Stripe integration not yet implemented. Add stripe package and uncomment implementation.',
    };
  }

  async capturePayment(externalPaymentId: string): Promise<CapturePaymentResult> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Stripe is not configured' };
    }

    // Stripe Checkout automatically captures payment
    // This method is for retrieving session details after redirect
    //
    // const stripe = new Stripe(getConfig().secretKey);
    // const session = await stripe.checkout.sessions.retrieve(externalPaymentId);
    //
    // return {
    //   success: session.payment_status === 'paid',
    //   transactionId: session.payment_intent as string,
    //   amount: session.amount_total ? session.amount_total / 100 : undefined,
    //   currency: session.currency?.toUpperCase(),
    //   payerEmail: session.customer_email || undefined,
    //   rawResponse: session,
    // };

    return {
      success: false,
      error: 'Stripe integration not yet implemented',
    };
  }

  async refundPayment(transactionId: string, amount?: number): Promise<RefundPaymentResult> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Stripe is not configured' };
    }

    // const stripe = new Stripe(getConfig().secretKey);
    //
    // const refund = await stripe.refunds.create({
    //   payment_intent: transactionId,
    //   amount: amount ? Math.round(amount * 100) : undefined, // undefined = full refund
    // });
    //
    // return {
    //   success: refund.status === 'succeeded',
    //   refundId: refund.id,
    //   amount: refund.amount ? refund.amount / 100 : undefined,
    // };

    return {
      success: false,
      error: 'Stripe integration not yet implemented',
    };
  }

  async verifyWebhook(payload: string, headers: Record<string, string>): Promise<boolean> {
    // const stripe = new Stripe(getConfig().secretKey);
    //
    // try {
    //   stripe.webhooks.constructEvent(
    //     payload,
    //     signature,
    //     getConfig().webhookSecret!
    //   );
    //   return true;
    // } catch (err) {
    //   return false;
    // }

    return false;
  }
}

// Export singleton instance
export const stripeProvider = new StripeProvider();
