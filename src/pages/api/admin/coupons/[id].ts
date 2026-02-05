/**
 * Admin Coupon Detail API
 * PATCH  /api/admin/coupons/[id] — Update coupon
 * DELETE /api/admin/coupons/[id] — Delete coupon
 */

import type { APIRoute } from 'astro';
import { createServerSupabase } from '@/lib/supabase';

async function verifyAdmin(cookies: any) {
  const supabase = createServerSupabase(cookies);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, authorized: false };
  const { data: admin } = await supabase.from('admin_users').select('id').eq('user_id', user.id).single();
  return { supabase, authorized: !!admin };
}

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const { supabase, authorized } = await verifyAdmin(cookies);
  if (!authorized) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403, headers: { 'Content-Type': 'application/json' },
    });
  }

  const id = params.id;
  const body = await request.json();

  // Build update object with only provided fields
  const updates: Record<string, any> = {};
  if (body.code !== undefined) updates.code = body.code.toUpperCase().trim();
  if (body.type !== undefined) updates.type = body.type;
  if (body.value !== undefined) updates.value = parseFloat(body.value);
  if (body.min_order !== undefined) updates.min_order = parseFloat(body.min_order);
  if (body.max_uses !== undefined) updates.max_uses = body.max_uses ? parseInt(body.max_uses) : null;
  if (body.valid_from !== undefined) updates.valid_from = body.valid_from || null;
  if (body.valid_to !== undefined) updates.valid_to = body.valid_to || null;
  if (body.is_active !== undefined) updates.is_active = body.is_active;

  if (Object.keys(updates).length === 0) {
    return new Response(JSON.stringify({ error: 'No fields to update' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data: coupon, error } = await supabase
    .from('coupons')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    const msg = error.code === '23505' ? 'Coupon code already exists' : error.message;
    return new Response(JSON.stringify({ error: msg }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ coupon }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  const { supabase, authorized } = await verifyAdmin(cookies);
  if (!authorized) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403, headers: { 'Content-Type': 'application/json' },
    });
  }

  const { error } = await supabase.from('coupons').delete().eq('id', params.id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};
