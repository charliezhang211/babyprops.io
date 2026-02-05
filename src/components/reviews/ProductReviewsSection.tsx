// ProductReviewsSection - PDP reviews wrapper (React Island)
// Combines ReviewsList + ReviewForm with scroll-to-form and AggregateRating JSON-LD injection

import { useState, useRef, useCallback, useEffect } from 'react';
import ReviewsList from '@/components/reviews/ReviewsList';
import ReviewForm from '@/components/reviews/ReviewForm';

interface ProductReviewsSectionProps {
  productSlug: string;
  productName: string;
}

export default function ProductReviewsSection({
  productSlug,
  productName,
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

  // Inject AggregateRating JSON-LD when review stats load
  useEffect(() => {
    async function injectSchema() {
      try {
        const res = await fetch(`/api/reviews/${productSlug}?limit=1`);
        if (!res.ok) return;
        const data = await res.json();
        const stats = data.stats;
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
  }, [productSlug, productName, refreshKey]);

  return (
    <div className="space-y-6">
      <ReviewsList
        key={`list-${refreshKey}`}
        productSlug={productSlug}
        productName={productName}
        onWriteReview={handleWriteReview}
      />

      {/* Review Form */}
      <div ref={formRef}>
        {showForm ? (
          <ReviewForm
            productSlug={productSlug}
            productName={productName}
            onSubmitted={handleSubmitted}
          />
        ) : (
          <div className="text-center">
            <button
              type="button"
              onClick={handleWriteReview}
              className="px-6 py-2.5 bg-brand text-white text-sm font-medium rounded-full hover:bg-brand-dark transition-colors duration-200 cursor-pointer border-none"
            >
              Write a Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
