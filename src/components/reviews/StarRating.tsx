// StarRating - Reusable star rating component
// Supports readonly display (with half-star) and interactive selection mode

import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
}

const sizeMap = { sm: 14, md: 18, lg: 24 };

const STAR_POINTS = '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2';

export default function StarRating({
  rating,
  max = 5,
  size = 'md',
  readonly = true,
  onChange,
  showValue = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [uniqueId] = useState(() => Math.random().toString(36).substring(2, 9));
  const px = sizeMap[size];

  const stars = Array.from({ length: max }, (_, i) => {
    const starNum = i + 1;

    if (!readonly) {
      const active = starNum <= (hoverRating || rating);
      return (
        <button
          key={starNum}
          type="button"
          className="p-0 bg-transparent border-none cursor-pointer"
          style={{ width: px, height: px }}
          onMouseEnter={() => setHoverRating(starNum)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => onChange?.(starNum)}
          aria-label={`Rate ${starNum} star${starNum > 1 ? 's' : ''}`}
        >
          <svg viewBox="0 0 24 24" width={px} height={px}>
            <polygon
              points={STAR_POINTS}
              fill={active ? '#FFD700' : 'none'}
              stroke="#FFD700"
              strokeWidth="2"
            />
          </svg>
        </button>
      );
    }

    // Readonly mode with fractional fill support
    const fill = Math.min(Math.max(rating - i, 0), 1);
    const fillPct = Math.round(fill * 100);

    if (fillPct === 100) {
      return (
        <svg key={starNum} viewBox="0 0 24 24" width={px} height={px}>
          <polygon points={STAR_POINTS} fill="#FFD700" stroke="#FFD700" strokeWidth="1.5" />
        </svg>
      );
    }

    if (fillPct === 0) {
      return (
        <svg key={starNum} viewBox="0 0 24 24" width={px} height={px}>
          <polygon points={STAR_POINTS} fill="none" stroke="#FFD700" strokeWidth="1.5" />
        </svg>
      );
    }

    // Partial fill (half star)
    const gradId = `star-${uniqueId}-${i}`;
    return (
      <svg key={starNum} viewBox="0 0 24 24" width={px} height={px}>
        <defs>
          <linearGradient id={gradId}>
            <stop offset={`${fillPct}%`} stopColor="#FFD700" />
            <stop offset={`${fillPct}%`} stopColor="transparent" />
          </linearGradient>
        </defs>
        <polygon points={STAR_POINTS} fill={`url(#${gradId})`} stroke="#FFD700" strokeWidth="1.5" />
      </svg>
    );
  });

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex gap-0.5" role={readonly ? 'img' : undefined} aria-label={readonly ? `${rating} out of ${max} stars` : undefined}>
        {stars}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-brand-dark">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
