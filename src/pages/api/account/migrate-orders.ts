/**
 * Migrate Orders API
 * POST /api/account/migrate-orders
 *
 * Associates guest orders (by email) with a user account
 * Called after guest checkout user creates an account
 */

import type { APIRoute } from 'astro';
import { createServerSupabase } from '@/lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createServerSupabase(cookies);

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const email = body.email || user.email;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Find guest orders by email that don't have a user_id
    const { data: orders, error: findError } = await supabase
      .from('orders')
      .select('id, order_number')
      .eq('email', email)
      .is('user_id', null);

    if (findError) {
      console.error('Failed to find orders:', findError);
      return new Response(JSON.stringify({ error: 'Failed to find orders' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!orders || orders.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No guest orders to migrate',
        migrated: 0,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update orders to associate with user
    const orderIds = orders.map(o => o.id);
    const { error: updateError } = await supabase
      .from('orders')
      .update({ user_id: user.id })
      .in('id', orderIds);

    if (updateError) {
      console.error('Failed to migrate orders:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to migrate orders' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`Migrated ${orders.length} orders for user ${user.id}`);

    return new Response(JSON.stringify({
      success: true,
      migrated: orders.length,
      orders: orders.map(o => o.order_number),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Migration error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
