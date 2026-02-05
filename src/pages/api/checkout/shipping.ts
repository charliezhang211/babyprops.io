/**
 * Shipping Configuration API
 * GET /api/checkout/shipping - Get shipping options
 * POST /api/checkout/shipping - Calculate shipping for cart
 */

import type { APIRoute } from 'astro';
import {
  getCountryOptions,
  getStateOptions,
  getShippingZones,
  calculateShipping,
  requiresState,
  isShippingAvailable,
  getDefaultCountry,
} from '@/lib/shipping';

export const GET: APIRoute = async ({ url }) => {
  try {
    const countryCode = url.searchParams.get('country');

    // If country specified, return states for that country
    if (countryCode) {
      const states = getStateOptions(countryCode);
      const needsState = requiresState(countryCode);
      const available = isShippingAvailable(countryCode);

      return new Response(JSON.stringify({
        success: true,
        country: countryCode,
        requiresState: needsState,
        shippingAvailable: available,
        states,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Return all shipping options
    const countries = getCountryOptions();
    const zones = getShippingZones();
    const defaultCountry = getDefaultCountry();

    return new Response(JSON.stringify({
      success: true,
      defaultCountry,
      countries,
      zones: zones.map(z => ({
        id: z.id,
        name: z.name,
        shippingRate: z.shippingRate,
        freeShipping: z.freeShipping,
        freeShippingThreshold: z.freeShippingThreshold,
        estimatedDays: z.estimatedDays,
      })),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Shipping API error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to get shipping options',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { countryCode, subtotal } = body;

    if (!countryCode) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Country code is required',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!isShippingAvailable(countryCode)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Shipping is not available to this country',
        shippingAvailable: false,
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const shipping = calculateShipping(countryCode, subtotal || 0);

    return new Response(JSON.stringify({
      success: true,
      shippingAvailable: true,
      ...shipping,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Shipping calculation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to calculate shipping',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
