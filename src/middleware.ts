/**
 * Astro Middleware - Sets up visitor tracking for cart functionality
 * @see https://docs.astro.build/en/guides/middleware/
 */

import { defineMiddleware } from 'astro:middleware';

const VISITOR_COOKIE_NAME = 'visitor_id';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Generate a unique visitor ID (UUID v4)
 */
function generateVisitorId(): string {
  // Use crypto.randomUUID if available (Node 19+, modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: generate UUID v4 manually
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { cookies, locals, request } = context;

  // Skip cookie operations for prerendered pages (cookies require request.headers)
  // Only run for server-rendered routes and API endpoints
  const isPrerendered = context.isPrerendered;

  if (!isPrerendered) {
    // Get or create visitor ID
    let visitorId = cookies.get(VISITOR_COOKIE_NAME)?.value;

    if (!visitorId) {
      visitorId = generateVisitorId();

      // Set cookie for persistence
      cookies.set(VISITOR_COOKIE_NAME, visitorId, {
        path: '/',
        maxAge: COOKIE_MAX_AGE,
        httpOnly: true,
        sameSite: 'lax',
        secure: import.meta.env.PROD,
      });
    }

    // Make visitorId available to all routes and API endpoints
    locals.visitorId = visitorId;
  }

  return next();
});
