/**
 * Reviews API - POST new review
 * POST /api/reviews
 *
 * Creates a new review (pending approval)
 */

import type { APIRoute } from 'astro';
import { createServerSupabase } from '@/lib/supabase';

interface ReviewSubmission {
  product_slug: string;
  rating: number;
  title?: string;
  content: string;
  reviewer_name: string;
  reviewer_email: string;
  images?: string[];
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createServerSupabase(cookies);

    // Get authenticated user (optional)
    const { data: { user } } = await supabase.auth.getUser();

    const body: ReviewSubmission = await request.json();

    // Validate required fields
    if (!body.product_slug) {
      return new Response(JSON.stringify({ error: 'Product slug required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return new Response(JSON.stringify({ error: 'Rating must be between 1 and 5' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!body.content || body.content.trim().length < 10) {
      return new Response(JSON.stringify({ error: 'Review content must be at least 10 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!body.reviewer_name || !body.reviewer_email) {
      return new Response(JSON.stringify({ error: 'Name and email required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.reviewer_email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check for duplicate review from same email for same product
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_slug', body.product_slug)
      .eq('reviewer_email', body.reviewer_email)
      .single();

    if (existing) {
      return new Response(JSON.stringify({ error: 'You have already reviewed this product' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Sanitize images array (max 3, validate URLs)
    let images: string[] = [];
    if (body.images && Array.isArray(body.images)) {
      images = body.images
        .slice(0, 3)
        .filter(url => typeof url === 'string' && url.startsWith('data:image/'));
    }

    // Create review
    // Note: Do NOT chain .select().single() here — the RLS SELECT policy
    // blocks reading pending reviews for anonymous users, which would cause
    // the entire operation to fail even though the INSERT succeeds.
    const { error } = await supabase
      .from('reviews')
      .insert({
        product_slug: body.product_slug,
        user_id: user?.id || null,
        reviewer_name: body.reviewer_name.trim(),
        reviewer_email: body.reviewer_email.toLowerCase().trim(),
        rating: body.rating,
        title: body.title?.trim() || null,
        content: body.content.trim(),
        images: images.length > 0 ? images : [],
        status: 'pending', // All reviews start as pending
      });

    if (error) {
      console.error('Failed to create review:', error);

      // Handle unique constraint violation
      if (error.code === '23505') {
        return new Response(JSON.stringify({ error: 'You have already reviewed this product' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'Failed to submit review' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`New review submitted for ${body.product_slug} by ${body.reviewer_email}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Review submitted successfully. It will appear after approval.',
      review: {
        rating: body.rating,
      },
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Review submission error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
