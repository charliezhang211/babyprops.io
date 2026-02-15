// PdpRating - Product detail page rating display (React Island)
// Fetches review stats client-side and shows stars + review count with anchor to #reviews

import { useState, useEffect } from 'react';
import StarRating from '@/components/reviews/StarRating';

const statsCache = new Map<string, { avg: number; count: number } | null>();

interface PdpRatingProps {
  productSlug: string;
}

export default function PdpRating({ productSlug }: PdpRatingProps) {
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

  if (!loaded || !stats) return null;

  return (
    <a
      href="#reviews"
      className="inline-flex items-center gap-2 no-underline transition-opacity duration-150 hover:opacity-80"
    >
      <StarRating rating={stats.avg} size="md" />
      <span className="text-sm text-slate-400 underline underline-offset-2 hover:text-brand">
        ({stats.count} customer review{stats.count > 1 ? 's' : ''})
      </span>
    </a>
  );
}
