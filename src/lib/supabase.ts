/**
 * Supabase Client Configuration
 * Server and browser clients for Astro SSR
 */

import { createBrowserClient, createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

// Environment variables
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

/**
 * Create a Supabase client for browser/client-side use
 */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Create a Supabase client for server-side use (API routes, middleware)
 * Handles cookies automatically via Astro's cookie API
 */
export function createServerSupabase(cookies: AstroCookies) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        // Collect all Supabase-related cookies
        const cookieStore: { name: string; value: string }[] = [];
        // Supabase auth cookies typically start with 'sb-'
        const sbCookieNames = [
          'sb-access-token',
          'sb-refresh-token',
          `sb-${supabaseUrl.split('//')[1]?.split('.')[0]}-auth-token`,
        ];
        for (const name of sbCookieNames) {
          const value = cookies.get(name)?.value;
          if (value) {
            cookieStore.push({ name, value });
          }
        }
        return cookieStore;
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        for (const { name, value, options } of cookiesToSet) {
          cookies.set(name, value, {
            path: '/',
            secure: import.meta.env.PROD,
            httpOnly: true,
            sameSite: 'lax',
            ...options,
          });
        }
      },
    },
  });
}

// ============================================
// DATABASE TYPES
// ============================================

export interface Database {
  public: {
    Tables: {
      carts: {
        Row: CartRow;
        Insert: CartInsert;
        Update: CartUpdate;
      };
      addresses: {
        Row: AddressRow;
        Insert: AddressInsert;
        Update: AddressUpdate;
      };
      orders: {
        Row: OrderRow;
        Insert: OrderInsert;
        Update: OrderUpdate;
      };
      order_items: {
        Row: OrderItemRow;
        Insert: OrderItemInsert;
        Update: OrderItemUpdate;
      };
    };
  };
}

// Cart Types
export interface CartRow {
  id: string;
  visitor_id: string;
  user_id: string | null;
  items: CartItemDB[];
  created_at: string;
  updated_at: string;
}

export interface CartInsert {
  id?: string;
  visitor_id: string;
  user_id?: string | null;
  items?: CartItemDB[];
}

export interface CartUpdate {
  user_id?: string | null;
  items?: CartItemDB[];
}

export interface CartItemDB {
  sku: string;
  product_slug: string;
  name: string;
  variant: string;
  color?: string;
  size?: string;
  custom_texts?: Record<string, string>;
  stripe?: {
    id: string;
    name: string;
    price: number;
  };
  addons: {
    id: string;
    name: string;
    price: number;
  }[];
  quantity: number;
  unit_price: number;
  image?: string;
}

// Address Types
export interface AddressRow {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  label: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressInsert {
  id?: string;
  user_id: string;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  label?: string;
  is_default?: boolean;
}

export interface AddressUpdate {
  full_name?: string;
  phone?: string | null;
  email?: string | null;
  address_line1?: string;
  address_line2?: string | null;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  label?: string;
  is_default?: boolean;
}

// Order Types
export interface OrderRow {
  id: string;
  order_number: string;
  visitor_id: string;
  user_id: string | null;
  email: string;
  paypal_order_id: string | null;
  paypal_capture_id: string | null;
  shipping_address: ShippingAddressSnapshot;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  customer_note: string | null;
  internal_note: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  shipped_at: string | null;
}

export interface OrderInsert {
  id?: string;
  order_number?: string;
  visitor_id: string;
  user_id?: string | null;
  email: string;
  paypal_order_id?: string | null;
  shipping_address: ShippingAddressSnapshot;
  subtotal: number;
  shipping_cost?: number;
  tax?: number;
  discount?: number;
  total: number;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  customer_note?: string | null;
}

export interface OrderUpdate {
  user_id?: string | null;
  paypal_order_id?: string | null;
  paypal_capture_id?: string | null;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  internal_note?: string | null;
  paid_at?: string | null;
  shipped_at?: string | null;
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'partial_refund';

// Order Item Types
export interface OrderItemRow {
  id: string;
  order_id: string;
  sku: string;
  product_slug: string;
  name: string;
  variant: string | null;
  color: string | null;
  size: string | null;
  custom_texts: Record<string, string> | null;
  stripe: { id: string; name: string; price: number } | null;
  addons: { id: string; name: string; price: number }[] | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  image: string | null;
  created_at: string;
}

export interface OrderItemInsert {
  id?: string;
  order_id: string;
  sku: string;
  product_slug: string;
  name: string;
  variant?: string | null;
  color?: string | null;
  size?: string | null;
  custom_texts?: Record<string, string> | null;
  stripe?: { id: string; name: string; price: number } | null;
  addons?: { id: string; name: string; price: number }[] | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  image?: string | null;
}

export interface OrderItemUpdate {
  // Order items are immutable after creation
}

// Shipping Address Snapshot (stored in order)
export interface ShippingAddressSnapshot {
  full_name: string;
  email: string;
  phone?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

/**
 * Check if the current user is an admin
 * Must be called in page frontmatter (not components) to allow redirect
 */
export async function checkAdmin(cookies: AstroCookies): Promise<{ supabase: ReturnType<typeof createServerSupabase>; isAdmin: boolean; user: any }> {
  const supabase = createServerSupabase(cookies);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { supabase, isAdmin: false, user: null };

  const { data } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .single();

  return { supabase, isAdmin: !!data, user };
}

// Legacy type for backward compatibility
export interface ShippingAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

// Review Stats Type
export interface ReviewStats {
  product_slug: string;
  review_count: number;
  average_rating: number;
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
  verified_count: number;
}

// Review Type
export interface Review {
  id: string;
  product_slug: string;
  reviewer_name: string;
  reviewer_email: string;
  title?: string;
  content: string;
  rating: number;
  created_at: string;
  verified_purchase: boolean;
  images?: string[];
  admin_response?: string;
  admin_responded_at?: string;
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * Fetch review stats for a product (server-side, fast query)
 * Uses pre-aggregated view for minimal latency
 */
export async function getProductReviewStats(
  supabase: ReturnType<typeof createServerSupabase>,
  productSlug: string
): Promise<ReviewStats | null> {
  const { data, error } = await supabase
    .from('product_review_stats')
    .select('*')
    .eq('product_slug', productSlug)
    .single();

  if (error || !data) {
    return null;
  }

  return data as ReviewStats;
}

/**
 * Fetch approved reviews for a product (server-side)
 * Used for SSR to eliminate client-side loading state
 */
export async function getProductReviews(
  supabase: ReturnType<typeof createServerSupabase>,
  productSlug: string,
  limit: number = 10
): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_slug', productSlug)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch reviews:', error);
    return [];
  }

  return (data || []) as Review[];
}
