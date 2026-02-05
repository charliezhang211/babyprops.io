/**
 * Addresses API
 * GET /api/account/addresses - Get user's addresses
 * POST /api/account/addresses - Create new address
 * PUT /api/account/addresses - Update address
 * DELETE /api/account/addresses - Delete address
 */

import type { APIRoute } from 'astro';
import { createServerSupabase } from '@/lib/supabase';

export const GET: APIRoute = async ({ cookies }) => {
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

    // Fetch user's addresses
    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch addresses:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch addresses' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ addresses }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Addresses error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

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

    // Validate required fields
    if (!body.full_name || !body.address_line1 || !body.city || !body.state || !body.postal_code) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create address
    const { data: address, error } = await supabase
      .from('addresses')
      .insert({
        user_id: user.id,
        full_name: body.full_name,
        phone: body.phone || null,
        email: body.email || user.email,
        address_line1: body.address_line1,
        address_line2: body.address_line2 || null,
        city: body.city,
        state: body.state,
        postal_code: body.postal_code,
        country: body.country || 'US',
        label: body.label || 'Home',
        is_default: body.is_default || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create address:', error);
      return new Response(JSON.stringify({ error: 'Failed to create address' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, address }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Create address error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ request, cookies }) => {
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

    if (!body.id) {
      return new Response(JSON.stringify({ error: 'Address ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update address (only if owned by user)
    const { data: address, error } = await supabase
      .from('addresses')
      .update({
        full_name: body.full_name,
        phone: body.phone,
        email: body.email,
        address_line1: body.address_line1,
        address_line2: body.address_line2,
        city: body.city,
        state: body.state,
        postal_code: body.postal_code,
        country: body.country,
        label: body.label,
        is_default: body.is_default,
      })
      .eq('id', body.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update address:', error);
      return new Response(JSON.stringify({ error: 'Failed to update address' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, address }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Update address error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
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

    if (!body.id) {
      return new Response(JSON.stringify({ error: 'Address ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete address (only if owned by user)
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', body.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to delete address:', error);
      return new Response(JSON.stringify({ error: 'Failed to delete address' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Delete address error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
