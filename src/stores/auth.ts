/**
 * Auth Store - Manages user authentication state
 * Uses Supabase Auth with Nano Stores for reactive state
 */

import { atom, computed } from 'nanostores';
import { createClient } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

// ============================================
// STATE
// ============================================

export const authUser = atom<User | null>(null);
export const authSession = atom<Session | null>(null);
export const authLoading = atom<boolean>(true);
export const authError = atom<string | null>(null);

// Computed: is user logged in
export const isAuthenticated = computed(authUser, (user) => !!user);

// ============================================
// INITIALIZATION
// ============================================

let initialized = false;

/**
 * Initialize auth state - call once on app load
 */
export async function initAuth() {
  if (initialized) return;
  initialized = true;

  try {
    const supabase = createClient();

    // Get initial session with timeout to prevent infinite loading
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Auth initialization timed out')), 5000)
    );

    const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]);
    if (error) throw error;

    authSession.set(session);
    authUser.set(session?.user ?? null);

    // Listen for auth changes (only after successful init)
    supabase.auth.onAuthStateChange(async (event, session) => {
      authSession.set(session);
      authUser.set(session?.user ?? null);
      authError.set(null);

      if (event === 'SIGNED_IN') {
        window.dispatchEvent(new CustomEvent('auth:signed-in', {
          detail: { user: session?.user }
        }));
      } else if (event === 'SIGNED_OUT') {
        window.dispatchEvent(new CustomEvent('auth:signed-out'));
      }
    });
  } catch (error) {
    console.error('Failed to get session:', error);
    authError.set('Failed to initialize authentication');
  } finally {
    authLoading.set(false);
  }
}

// ============================================
// AUTH ACTIONS
// ============================================

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, metadata?: {
  full_name?: string;
}) {
  authLoading.set(true);
  authError.set(null);

  const supabase = createClient();

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;

    return { success: true, data, needsEmailConfirmation: !data.session };
  } catch (error: any) {
    const message = error.message || 'Failed to sign up';
    authError.set(message);
    return { success: false, error: message };
  } finally {
    authLoading.set(false);
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  authLoading.set(true);
  authError.set(null);

  const supabase = createClient();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    const message = error.message || 'Failed to sign in';
    authError.set(message);
    return { success: false, error: message };
  } finally {
    authLoading.set(false);
  }
}

/**
 * Sign out
 */
export async function signOut() {
  authLoading.set(true);
  authError.set(null);

  const supabase = createClient();

  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Clear local state
    authUser.set(null);
    authSession.set(null);

    return { success: true };
  } catch (error: any) {
    const message = error.message || 'Failed to sign out';
    authError.set(message);
    return { success: false, error: message };
  } finally {
    authLoading.set(false);
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  authLoading.set(true);
  authError.set(null);

  const supabase = createClient();

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    const message = error.message || 'Failed to send reset email';
    authError.set(message);
    return { success: false, error: message };
  } finally {
    authLoading.set(false);
  }
}

/**
 * Update password (after reset)
 */
export async function updatePassword(newPassword: string) {
  authLoading.set(true);
  authError.set(null);

  const supabase = createClient();

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    const message = error.message || 'Failed to update password';
    authError.set(message);
    return { success: false, error: message };
  } finally {
    authLoading.set(false);
  }
}

/**
 * Update user profile
 */
export async function updateProfile(data: {
  full_name?: string;
  avatar_url?: string;
}) {
  authLoading.set(true);
  authError.set(null);

  const supabase = createClient();

  try {
    const { error } = await supabase.auth.updateUser({
      data,
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    const message = error.message || 'Failed to update profile';
    authError.set(message);
    return { success: false, error: message };
  } finally {
    authLoading.set(false);
  }
}

// ============================================
// GUEST CONVERSION
// ============================================

/**
 * Convert guest checkout to account
 * Called after payment success when user sets a password
 */
export async function convertGuestToMember(email: string, password: string, orderEmail: string) {
  // First sign up
  const result = await signUp(email, password);

  if (!result.success) {
    return result;
  }

  // If email confirmation is required, return early
  if (result.needsEmailConfirmation) {
    return {
      success: true,
      needsEmailConfirmation: true,
      message: 'Please check your email to confirm your account.',
    };
  }

  // After signup, migrate guest orders to new account
  // This happens server-side via the auth callback
  return {
    success: true,
    message: 'Account created successfully!',
  };
}
