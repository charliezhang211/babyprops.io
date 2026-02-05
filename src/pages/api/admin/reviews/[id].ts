/**
 * Admin Review Detail API
 * PUT /api/admin/reviews/[id] - Update review (approve/reject/respond)
 * DELETE /api/admin/reviews/[id] - Delete review
 */

import type { APIRoute } from 'astro';
import { createServerSupabase } from '@/lib/supabase';

// Helper to check if user is admin
async function isAdmin(supabase: ReturnType<typeof createServerSupabase>): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .single();

  return !!data;
}

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  try {
    const supabase = createServerSupabase(cookies);

    // Check admin access
    if (!await isAdmin(supabase)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Review ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    // Handle status update (approve/reject)
    if (body.status) {
      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(body.status)) {
        return new Response(JSON.stringify({ error: 'Invalid status' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      updates.status = body.status;
    }

    // Handle admin response
    if (body.admin_response !== undefined) {
      updates.admin_response = body.admin_response || null;
      updates.admin_responded_at = body.admin_response ? new Date().toISOString() : null;
    }

    if (Object.keys(updates).length === 0) {
      return new Response(JSON.stringify({ error: 'No valid fields to update' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update review
    const { data: review, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update review:', error);
      return new Response(JSON.stringify({ error: 'Failed to update review' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`Review ${id} updated:`, updates);

    return new Response(JSON.stringify({
      success: true,
      review,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Admin review update error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  try {
    const supabase = createServerSupabase(cookies);

    // Check admin access
    if (!await isAdmin(supabase)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Review ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete review:', error);
      return new Response(JSON.stringify({ error: 'Failed to delete review' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`Review ${id} deleted`);

    return new Response(JSON.stringify({
      success: true,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Admin review delete error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
