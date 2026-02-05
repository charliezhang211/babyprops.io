// ReviewCard - Single review display component
// Shows star rating, reviewer info, verified badge, content, photos (with lightbox), and seller reply

import { useState } from 'react';
import StarRating from '@/components/reviews/StarRating';

// ─── Types ────────────────────────────────────────────────────

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
}

interface ReviewCardProps {
  review: Review;
}

// ─── Component ────────────────────────────────────────────────

export default function ReviewCard({ review }: ReviewCardProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const date = new Date(review.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5" data-component="review-card">
      {/* Header: Avatar + Name + Date */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center text-sm font-semibold text-brand-dark flex-shrink-0">
            {review.reviewer_name[0]?.toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-brand-dark">{review.reviewer_name}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{date}</span>
              {review.verified_purchase && (
                <span className="inline-flex items-center gap-1 text-xs text-brand-accent font-medium">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Verified Purchase
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="mb-2">
        <StarRating rating={review.rating} size="sm" />
      </div>

      {/* Title + Content */}
      {review.title && (
        <h4 className="text-sm font-semibold text-brand-dark mb-1">{review.title}</h4>
      )}
      <p className="text-sm text-gray-600 leading-relaxed">{review.content}</p>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mt-3">
          {review.images.map((img, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setLightboxImage(img)}
              className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 hover:border-brand transition-colors cursor-pointer p-0 bg-transparent"
            >
              <img
                src={img}
                alt={`Review photo ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Admin Response */}
      {review.admin_response && (
        <div className="mt-4 p-3 bg-brand-light rounded-lg border-l-4 border-brand">
          <div className="flex items-center gap-1.5 mb-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-dark">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="text-xs font-semibold text-brand-dark uppercase tracking-wide">
              Seller Response
            </span>
          </div>
          <p className="text-sm text-gray-600">{review.admin_response}</p>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-lg max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage}
              alt="Review photo enlarged"
              className="max-w-full max-h-[80vh] rounded-lg object-contain"
            />
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white text-gray-600 rounded-full shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer border-none text-lg"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
