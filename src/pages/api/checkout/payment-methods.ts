/**
 * Payment Methods API
 * GET /api/checkout/payment-methods
 *
 * Returns available payment methods for checkout
 */

import type { APIRoute } from 'astro';
import { getClientPaymentMethods } from '@/lib/payments';

export const GET: APIRoute = async () => {
  try {
    const methods = getClientPaymentMethods();

    return new Response(JSON.stringify({
      success: true,
      methods,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to get payment methods:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to get payment methods',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
