/**
 * Admin Reviews API
 * GET /api/admin/reviews - List reviews for moderation
 *
 * Query params:
 * - page: Page number (default 1)
 * - limit: Items per page (default 20)
 * - status: Filter by status (pending, approved, rejected)
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

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createServerSupabase(cookies);

    // Check admin access
    if (!await isAdmin(supabase)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const status = url.searchParams.get('status');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by status
    if (status) {
      query = query.eq('status', status);
    }

    const { data: reviews, error, count } = await query;

    if (error) {
      console.error('Failed to fetch reviews:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch reviews' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get summary counts
    const { data: stats } = await supabase
      .from('reviews')
      .select('status');

    const summary = {
      total: stats?.length || 0,
      pending: stats?.filter(r => r.status === 'pending').length || 0,
      approved: stats?.filter(r => r.status === 'approved').length || 0,
      rejected: stats?.filter(r => r.status === 'rejected').length || 0,
    };

    return new Response(JSON.stringify({
      reviews: reviews || [],
      summary,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Admin reviews error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
