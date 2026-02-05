/**
 * PayPal Payment Provider
 * Implements PaymentProvider interface for PayPal REST API
 */

import type {
  PaymentProvider,
  PaymentOrderData,
  CreatePaymentResult,
  CapturePaymentResult,
  RefundPaymentResult,
} from '../types';
import { CURRENCY } from '@/config/site';

// Environment config
const getConfig = () => ({
  apiUrl: import.meta.env.PAYPAL_SANDBOX === 'true'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com',
  clientId: import.meta.env.PUBLIC_PAYPAL_CLIENT_ID || import.meta.env.PAYPAL_CLIENT_ID,
  clientSecret: import.meta.env.PAYPAL_CLIENT_SECRET,
  brandName: import.meta.env.SITE_NAME || 'Your Store Name',
  siteUrl: import.meta.env.SITE_URL || 'http://localhost:4321',
});

// ============================================
// Internal PayPal API Types
// ============================================

interface PayPalAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PayPalOrderUnit {
  amount: {
    currency_code: string;
    value: string;
    breakdown?: {
      item_total: { currency_code: string; value: string };
      shipping?: { currency_code: string; value: string };
      tax_total?: { currency_code: string; value: string };
      discount?: { currency_code: string; value: string };
    };
  };
  items?: Array<{
    name: string;
    quantity: string;
    unit_amount: { currency_code: string; value: string };
    sku?: string;
  }>;
  shipping?: {
    name?: { full_name: string };
    address?: {
      address_line_1: string;
      address_line_2?: string;
      admin_area_2: string;
      admin_area_1: string;
      postal_code: string;
      country_code: string;
    };
  };
}

// ============================================
// PayPal Provider Implementation
// ============================================

class PayPalProvider implements PaymentProvider {
  id = 'paypal' as const;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  isConfigured(): boolean {
    const config = getConfig();
    return !!(config.clientId && config.clientSecret);
  }

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const config = getConfig();
    const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

    const response = await fetch(`${config.apiUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PayPal auth failed: ${error}`);
    }

    const data: PayPalAccessToken = await response.json();
    this.accessToken = data.access_token;
    // Set expiry 5 minutes before actual expiry for safety
    this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

    return this.accessToken;
  }

  async createPayment(data: PaymentOrderData): Promise<CreatePaymentResult> {
    if (!this.isConfigured()) {
      return { success: false, error: 'PayPal is not configured' };
    }

    try {
      const config = getConfig();
      const accessToken = await this.getAccessToken();

      const purchaseUnit: PayPalOrderUnit = {
        amount: {
          currency_code: data.currency,
          value: data.total.toFixed(2),
          breakdown: {
            item_total: { currency_code: data.currency, value: data.subtotal.toFixed(2) },
            shipping: { currency_code: data.currency, value: data.shipping.toFixed(2) },
            tax_total: { currency_code: data.currency, value: data.tax.toFixed(2) },
            discount: { currency_code: data.currency, value: data.discount.toFixed(2) },
          },
        },
        items: data.items.map(item => ({
          name: item.name.slice(0, 127), // PayPal max 127 chars
          quantity: item.quantity.toString(),
          unit_amount: { currency_code: data.currency, value: item.unit_price.toFixed(2) },
          sku: item.sku,
        })),
        shipping: {
          name: { full_name: data.shippingAddress.fullName },
          address: {
            address_line_1: data.shippingAddress.addressLine1,
            address_line_2: data.shippingAddress.addressLine2 || undefined,
            admin_area_2: data.shippingAddress.city,
            admin_area_1: data.shippingAddress.state,
            postal_code: data.shippingAddress.postalCode,
            country_code: data.shippingAddress.countryCode,
          },
        },
      };

      const response = await fetch(`${config.apiUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': data.orderNumber, // Idempotency key
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [purchaseUnit],
          application_context: {
            brand_name: config.brandName,
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW',
            return_url: `${config.siteUrl}/checkout/return`,
            cancel_url: `${config.siteUrl}/checkout/`,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('PayPal create order error:', error);
        return { success: false, error: error.message || 'Failed to create PayPal order' };
      }

      const result = await response.json();
      return {
        success: true,
        externalPaymentId: result.id,
        metadata: { status: result.status },
      };
    } catch (error) {
      console.error('PayPal createPayment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async capturePayment(externalPaymentId: string): Promise<CapturePaymentResult> {
    if (!this.isConfigured()) {
      return { success: false, error: 'PayPal is not configured' };
    }

    try {
      const config = getConfig();
      const accessToken = await this.getAccessToken();

      const response = await fetch(
        `${config.apiUrl}/v2/checkout/orders/${externalPaymentId}/capture`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('PayPal capture error:', error);
        return { success: false, error: error.message || 'Failed to capture payment' };
      }

      const result = await response.json();
      const capture = result.purchase_units?.[0]?.payments?.captures?.[0];

      return {
        success: result.status === 'COMPLETED',
        transactionId: capture?.id,
        amount: capture?.amount?.value ? parseFloat(capture.amount.value) : undefined,
        currency: capture?.amount?.currency_code,
        payerEmail: result.payer?.email_address,
        payerName: result.payer?.name
          ? `${result.payer.name.given_name} ${result.payer.name.surname}`
          : undefined,
        rawResponse: result,
      };
    } catch (error) {
      console.error('PayPal capturePayment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<RefundPaymentResult> {
    if (!this.isConfigured()) {
      return { success: false, error: 'PayPal is not configured' };
    }

    try {
      const config = getConfig();
      const accessToken = await this.getAccessToken();

      const body: Record<string, unknown> = {};
      if (amount) {
        body.amount = {
          currency_code: CURRENCY.code,
          value: amount.toFixed(2),
        };
      }

      const response = await fetch(
        `${config.apiUrl}/v2/payments/captures/${transactionId}/refund`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('PayPal refund error:', error);
        return { success: false, error: error.message || 'Failed to refund payment' };
      }

      const result = await response.json();
      return {
        success: result.status === 'COMPLETED',
        refundId: result.id,
        amount: result.amount?.value ? parseFloat(result.amount.value) : undefined,
      };
    } catch (error) {
      console.error('PayPal refundPayment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async verifyWebhook(payload: string, headers: Record<string, string>): Promise<boolean> {
    const config = getConfig();
    const webhookId = import.meta.env.PAYPAL_WEBHOOK_ID;

    if (!webhookId) {
      console.warn('PayPal webhook ID not configured');
      return false;
    }

    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${config.apiUrl}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_algo: headers['paypal-auth-algo'],
          cert_url: headers['paypal-cert-url'],
          transmission_id: headers['paypal-transmission-id'],
          transmission_sig: headers['paypal-transmission-sig'],
          transmission_time: headers['paypal-transmission-time'],
          webhook_id: webhookId,
          webhook_event: JSON.parse(payload),
        }),
      });

      if (!response.ok) {
        console.error('Webhook verification failed');
        return false;
      }

      const data = await response.json();
      return data.verification_status === 'SUCCESS';
    } catch (error) {
      console.error('Webhook verification error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const paypalProvider = new PayPalProvider();
