/**
 * Admin Coupons API
 * GET  /api/admin/coupons — List all coupons with summary
 * POST /api/admin/coupons — Create a new coupon
 */

import type { APIRoute } from 'astro';
import { createServerSupabase } from '@/lib/supabase';

export const GET: APIRoute = async ({ cookies, url }) => {
  const supabase = createServerSupabase(cookies);

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }
  const { data: admin } = await supabase.from('admin_users').select('id').eq('user_id', user.id).single();
  if (!admin) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403, headers: { 'Content-Type': 'application/json' },
    });
  }

  const status = url.searchParams.get('status'); // active | expired | all
  const page = parseInt(url.searchParams.get('page') || '1');
  const perPage = 20;

  let query = supabase.from('coupons').select('*', { count: 'exact' });

  if (status === 'active') {
    query = query.eq('is_active', true);
  } else if (status === 'expired') {
    query = query.or(`is_active.eq.false,valid_to.lt.${new Date().toISOString()}`);
  }

  query = query.order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  const { data: coupons, count, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  // Summary
  const { data: allCoupons } = await supabase.from('coupons').select('is_active, valid_to, used_count');
  const now = new Date();
  const summary = {
    total: allCoupons?.length || 0,
    active: allCoupons?.filter(c => c.is_active && (!c.valid_to || new Date(c.valid_to) >= now)).length || 0,
    expired: allCoupons?.filter(c => !c.is_active || (c.valid_to && new Date(c.valid_to) < now)).length || 0,
    total_uses: allCoupons?.reduce((sum, c) => sum + (c.used_count || 0), 0) || 0,
  };

  return new Response(JSON.stringify({
    coupons: coupons || [],
    summary,
    pagination: { page, perPage, total: count || 0, totalPages: Math.ceil((count || 0) / perPage) },
  }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createServerSupabase(cookies);

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }
  const { data: admin } = await supabase.from('admin_users').select('id').eq('user_id', user.id).single();
  if (!admin) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403, headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();
  const { code, type, value, min_order, max_uses, valid_from, valid_to } = body;

  if (!code || !type || value == null) {
    return new Response(JSON.stringify({ error: 'code, type, and value are required' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!['fixed', 'percentage'].includes(type)) {
    return new Response(JSON.stringify({ error: 'type must be fixed or percentage' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  if (type === 'percentage' && (value <= 0 || value > 100)) {
    return new Response(JSON.stringify({ error: 'Percentage must be between 1 and 100' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data: coupon, error } = await supabase
    .from('coupons')
    .insert({
      code: code.toUpperCase().trim(),
      type,
      value: parseFloat(value),
      min_order: min_order ? parseFloat(min_order) : 0,
      max_uses: max_uses ? parseInt(max_uses) : null,
      valid_from: valid_from || new Date().toISOString(),
      valid_to: valid_to || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    const msg = error.code === '23505' ? 'Coupon code already exists' : error.message;
    return new Response(JSON.stringify({ error: msg }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ coupon }), {
    status: 201, headers: { 'Content-Type': 'application/json' },
  });
};
