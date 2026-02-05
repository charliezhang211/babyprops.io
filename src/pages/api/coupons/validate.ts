/**
 * Coupon Validation API
 * POST /api/coupons/validate
 *
 * Validates a coupon code and returns the discount amount
 */

import type { APIRoute } from 'astro';
import { createServerSupabase } from '@/lib/supabase';
import { formatPrice } from '@/config/site';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { code, subtotal } = await request.json();

    if (!code || typeof subtotal !== 'number') {
      return new Response(JSON.stringify({ valid: false, error: 'Missing code or subtotal' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createServerSupabase(cookies);

    const { data: coupon, error: dbError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .single();

    if (dbError || !coupon) {
      return new Response(JSON.stringify({ valid: false, error: 'Invalid coupon code' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check validity period
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return new Response(JSON.stringify({ valid: false, error: 'Coupon is not yet active' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (coupon.valid_to && new Date(coupon.valid_to) < now) {
      return new Response(JSON.stringify({ valid: false, error: 'Coupon has expired' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check usage limit
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return new Response(JSON.stringify({ valid: false, error: 'Coupon usage limit reached' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check minimum order
    if (subtotal < coupon.min_order) {
      return new Response(JSON.stringify({
        valid: false,
        error: `Minimum order of ${formatPrice(coupon.min_order)} required`,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Calculate discount
    const discount = coupon.type === 'percentage'
      ? Math.round(subtotal * coupon.value / 100 * 100) / 100
      : Math.min(coupon.value, subtotal);

    return new Response(JSON.stringify({
      valid: true,
      discount,
      type: coupon.type,
      value: coupon.value,
      code: coupon.code,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return new Response(JSON.stringify({ valid: false, error: 'Validation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
