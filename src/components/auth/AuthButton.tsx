/**
 * AuthButton - React Island Component
 * Shows login link or user dropdown in header
 * Uses Tailwind classes matching BabyProps Morandi color scheme
 */

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import {
  authUser,
  authLoading,
  isAuthenticated,
  signOut,
  initAuth,
} from '@/stores/auth';
import { initCartListeners } from '@/stores/cart';

export default function AuthButton() {
  const user = useStore(authUser);
  const loading = useStore(authLoading);
  const isLoggedIn = useStore(isAuthenticated);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hide static fallback icon now that React island is mounted
    document.getElementById('auth-fallback')?.remove();
    initAuth();
    initCartListeners();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setShowDropdown(false);
    const result = await signOut();
    if (result.success) {
      window.location.href = '/';
    }
  };

  // Get user initials for avatar
  const getInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || 'U';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading || !isLoggedIn) {
    return (
      <a
        href="/auth/login/"
        className="p-2 text-gray-700 hover:text-brand transition-colors"
        aria-label="Sign In"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </a>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-1 p-1 group"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-expanded={showDropdown}
        aria-label="Account menu"
      >
        <span className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-white text-xs font-semibold">
          {getInitials()}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-gray-500 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] overflow-hidden">
          {/* User info header */}
          <div className="px-4 py-3 bg-brand-light">
            <span className="block text-sm font-semibold text-brand-dark">
              {user?.user_metadata?.full_name || 'User'}
            </span>
            <span className="block text-xs text-gray-500 mt-0.5 truncate">
              {user?.email}
            </span>
          </div>

          <div className="h-px bg-gray-200" />

          {/* Menu items */}
          <div className="py-1">
            <a
              href="/account/"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-light hover:text-brand-dark transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Dashboard
            </a>

            <a
              href="/account/orders/"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-light hover:text-brand-dark transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              </svg>
              Orders
            </a>

            <a
              href="/account/addresses/"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-light hover:text-brand-dark transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Addresses
            </a>
          </div>

          <div className="h-px bg-gray-200" />

          <div className="py-1">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
