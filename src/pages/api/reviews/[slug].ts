/**
 * Reviews API - GET reviews by product slug
 * GET /api/reviews/[slug]?page=1&limit=10&rating=5
 *
 * Returns approved reviews for a specific product
 */

import type { APIRoute } from 'astro';
import { createServerSupabase } from '@/lib/supabase';

export const GET: APIRoute = async ({ params, request, cookies }) => {
  try {
    const supabase = createServerSupabase(cookies);
    const { slug } = params;

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Product slug required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
    const rating = url.searchParams.get('rating');
    const sort = url.searchParams.get('sort') || 'newest';
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('product_slug', slug)
      .eq('status', 'approved');

    // Filter by rating if specified
    if (rating) {
      query = query.eq('rating', parseInt(rating));
    }

    // Apply sorting
    if (sort === 'highest') {
      query = query.order('rating', { ascending: false }).order('created_at', { ascending: false });
    } else if (sort === 'lowest') {
      query = query.order('rating', { ascending: true }).order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data: reviews, error, count } = await query;

    if (error) {
      console.error('Failed to fetch reviews:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch reviews' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get review stats
    const { data: stats } = await supabase
      .from('product_review_stats')
      .select('*')
      .eq('product_slug', slug)
      .single();

    return new Response(JSON.stringify({
      reviews: reviews || [],
      stats: stats || {
        review_count: 0,
        average_rating: 0,
        five_star: 0,
        four_star: 0,
        three_star: 0,
        two_star: 0,
        one_star: 0,
        verified_count: 0,
      },
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
    console.error('Reviews error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
