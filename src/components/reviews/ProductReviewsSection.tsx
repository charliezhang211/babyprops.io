// ProductReviewsSection - PDP reviews wrapper (React Island)
// Combines ReviewsList + ReviewForm with scroll-to-form and AggregateRating JSON-LD injection

import { useState, useRef, useCallback, useEffect } from 'react';
import ReviewsList from '@/components/reviews/ReviewsList';
import ReviewForm from '@/components/reviews/ReviewForm';

interface ReviewStats {
  review_count: number;
  average_rating: number;
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
  verified_count: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Review {
  id: string;
  product_slug: string;
  reviewer_name: string;
  reviewer_email: string;
  rating: number;
  title?: string;
  content: string;
  images: string[];
  verified_purchase: boolean;
  admin_response?: string;
  admin_responded_at?: string;
  created_at: string;
}

interface ProductReviewsSectionProps {
  productSlug: string;
  productName: string;
  // SSR pre-loaded data (optional)
  initialReviews?: Review[];
  initialStats?: ReviewStats | null;
  initialPagination?: Pagination | null;
}

export default function ProductReviewsSection({
  productSlug,
  productName,
  initialReviews,
  initialStats,
  initialPagination,
}: ProductReviewsSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const formRef = useRef<HTMLDivElement>(null);

  const handleWriteReview = useCallback(() => {
    setShowForm(true);
    // Scroll to form after render
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const handleSubmitted = useCallback(() => {
    // Refresh the review list to reflect new submission
    setRefreshKey((k) => k + 1);
    // Scroll back to list top
    setTimeout(() => {
      const section = document.getElementById('reviews');
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 500);
  }, []);

  // Inject AggregateRating JSON-LD when review stats available
  useEffect(() => {
    async function injectSchema() {
      try {
        // Use SSR stats if available, otherwise fetch
        let stats = initialStats;
        if (!stats) {
          const res = await fetch(`/api/reviews/${productSlug}?limit=1`);
          if (!res.ok) return;
          const data = await res.json();
          stats = data.stats;
        }
        if (!stats || stats.review_count === 0) return;

        // Build AggregateRating schema
        const schema = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: productName,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: stats.average_rating.toFixed(1),
            reviewCount: String(stats.review_count),
            bestRating: '5',
            worstRating: '1',
          },
        };

        // Inject into head if not already present
        const existingTag = document.querySelector(
          'script[data-review-schema]'
        );
        if (existingTag) {
          existingTag.textContent = JSON.stringify(schema);
        } else {
          const script = document.createElement('script');
          script.type = 'application/ld+json';
          script.setAttribute('data-review-schema', 'true');
          script.textContent = JSON.stringify(schema);
          document.head.appendChild(script);
        }
      } catch {
        // Silently fail - schema is optional
      }
    }

    injectSchema();
  }, [productSlug, productName, initialStats, refreshKey]);

  return (
    <div className="space-y-6">
      <ReviewsList
        key={`list-${refreshKey}`}
        productSlug={productSlug}
        productName={productName}
        onWriteReview={handleWriteReview}
        initialReviews={refreshKey === 0 ? initialReviews : undefined}
        initialStats={initialStats}
        initialPagination={refreshKey === 0 ? initialPagination : undefined}
      />

      {/* Review Form */}
      {showForm && (
        <div ref={formRef}>
          <ReviewForm
            productSlug={productSlug}
            productName={productName}
            onSubmitted={handleSubmitted}
          />
        </div>
      )}
    </div>
  );
}
