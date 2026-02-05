// ProductCardRating - Lightweight star rating for product cards (React Island)
// Fetches review stats client-side and displays average rating + count
// Use with client:visible for lazy loading

import { useState, useEffect } from 'react';
import StarRating from '@/components/reviews/StarRating';

// Module-level cache to avoid duplicate fetches across card instances
const statsCache = new Map<string, { avg: number; count: number } | null>();

interface ProductCardRatingProps {
  productSlug: string;
}

export default function ProductCardRating({ productSlug }: ProductCardRatingProps) {
  const [stats, setStats] = useState<{ avg: number; count: number } | null>(
    statsCache.get(productSlug) ?? null
  );
  const [loaded, setLoaded] = useState(statsCache.has(productSlug));

  useEffect(() => {
    if (statsCache.has(productSlug)) {
      setStats(statsCache.get(productSlug) ?? null);
      setLoaded(true);
      return;
    }

    let cancelled = false;

    async function fetchStats() {
      try {
        const res = await fetch(`/api/reviews/${productSlug}?limit=1`);
        if (!res.ok) return;
        const data = await res.json();
        const s = data.stats;
        const result =
          s && s.review_count > 0
            ? { avg: s.average_rating, count: s.review_count }
            : null;

        statsCache.set(productSlug, result);
        if (!cancelled) {
          setStats(result);
          setLoaded(true);
        }
      } catch {
        statsCache.set(productSlug, null);
        if (!cancelled) setLoaded(true);
      }
    }

    fetchStats();
    return () => { cancelled = true; };
  }, [productSlug]);

  // Don't render anything until loaded, and hide if no reviews
  if (!loaded || !stats) return null;

  return (
    <div className="flex items-center gap-1.5" data-component="product-card-rating">
      <StarRating rating={stats.avg} size="sm" />
      <span className="text-xs text-gray-500">
        ({stats.count})
      </span>
    </div>
  );
}
