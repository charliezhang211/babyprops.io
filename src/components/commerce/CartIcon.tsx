/**
 * CartIcon - React Island Component
 * Displays cart icon with item count badge in Header
 * Includes animation feedback when items are added
 */

import { useStore } from '@nanostores/react';
import { useState, useEffect, useRef } from 'react';
import { cartCount } from '@/stores/cart';

export default function CartIcon() {
  const count = useStore(cartCount);
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevCountRef = useRef(count);

  // Only show count after client-side mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Animate when count increases
  useEffect(() => {
    if (isMounted && count > prevCountRef.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = count;
  }, [count, isMounted]);

  // Listen for cart-item-added event for immediate feedback
  useEffect(() => {
    const handleCartAdd = () => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    };

    window.addEventListener('cart-item-added', handleCartAdd);
    return () => window.removeEventListener('cart-item-added', handleCartAdd);
  }, []);

  return (
    <a
      href="/cart/"
      className={`relative p-2 text-gray-700 hover:text-brand transition-colors ${isAnimating ? 'animate-bounce' : ''}`}
      aria-label="View Cart"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
      </svg>
      {isMounted && count > 0 && (
        <span
          className={`absolute -top-0.5 -right-0.5 min-w-[20px] h-5 flex items-center justify-center text-xs font-bold text-white bg-brand rounded-full px-1.5 ${isAnimating ? 'scale-125' : ''} transition-transform`}
        >
          {count}
        </span>
      )}
    </a>
  );
}
