/**
 * PayPal Server-side API Helper
 * Handles order creation and capture via PayPal REST API
 */

const PAYPAL_API_URL = import.meta.env.PAYPAL_SANDBOX === 'true'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

const PAYPAL_CLIENT_ID = import.meta.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = import.meta.env.PAYPAL_CLIENT_SECRET;

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
    description?: string;
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

interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{ href: string; rel: string; method: string }>;
}

interface PayPalCaptureResponse {
  id: string;
  status: string;
  purchase_units: Array<{
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: { currency_code: string; value: string };
      }>;
    };
  }>;
  payer: {
    email_address: string;
    payer_id: string;
    name: { given_name: string; surname: string };
  };
}

/**
 * Get PayPal access token using client credentials
 */
async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
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
  return data.access_token;
}

export interface CreateOrderParams {
  orderNumber: string;
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
    unit_price: number;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    countryCode: string;
  };
}

/**
 * Create a PayPal order
 */
export async function createPayPalOrder(params: CreateOrderParams): Promise<PayPalOrderResponse> {
  const accessToken = await getAccessToken();

  const purchaseUnit: PayPalOrderUnit = {
    amount: {
      currency_code: 'USD',
      value: params.total.toFixed(2),
      breakdown: {
        item_total: { currency_code: 'USD', value: params.subtotal.toFixed(2) },
        shipping: { currency_code: 'USD', value: params.shipping.toFixed(2) },
        tax_total: { currency_code: 'USD', value: params.tax.toFixed(2) },
        discount: { currency_code: 'USD', value: params.discount.toFixed(2) },
      },
    },
    items: params.items.map(item => ({
      name: item.name.slice(0, 127), // PayPal max 127 chars
      quantity: item.quantity.toString(),
      unit_amount: { currency_code: 'USD', value: item.unit_price.toFixed(2) },
      sku: item.sku,
    })),
    shipping: {
      name: { full_name: params.shippingAddress.fullName },
      address: {
        address_line_1: params.shippingAddress.addressLine1,
        address_line_2: params.shippingAddress.addressLine2 || undefined,
        admin_area_2: params.shippingAddress.city,
        admin_area_1: params.shippingAddress.state,
        postal_code: params.shippingAddress.postalCode,
        country_code: params.shippingAddress.countryCode,
      },
    },
  };

  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': params.orderNumber, // Idempotency key
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [purchaseUnit],
      application_context: {
        brand_name: 'Dvotinst',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${import.meta.env.SITE_URL}/checkout/return`,
        cancel_url: `${import.meta.env.SITE_URL}/checkout/`,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('PayPal create order error:', error);
    throw new Error(error.message || 'Failed to create PayPal order');
  }

  return response.json();
}

/**
 * Capture a PayPal order (after customer approval)
 */
export async function capturePayPalOrder(paypalOrderId: string): Promise<PayPalCaptureResponse> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('PayPal capture error:', error);
    throw new Error(error.message || 'Failed to capture PayPal payment');
  }

  return response.json();
}

/**
 * Verify webhook signature (for async notifications)
 */
export async function verifyWebhookSignature(
  headers: Record<string, string>,
  body: string,
  webhookId: string
): Promise<boolean> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`, {
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
      webhook_event: JSON.parse(body),
    }),
  });

  if (!response.ok) {
    console.error('Webhook verification failed');
    return false;
  }

  const data = await response.json();
  return data.verification_status === 'SUCCESS';
}
