// ReviewsList - Main reviews display component (React Island)
// Displays rating summary, sortable review list with Load More pagination

import { useState, useEffect, useRef, useCallback } from 'react';
import StarRating from '@/components/reviews/StarRating';
import ReviewCard from '@/components/reviews/ReviewCard';
import type { Review } from '@/components/reviews/ReviewCard';

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

type SortOption = 'newest' | 'highest' | 'lowest';

interface ReviewsListProps {
  productSlug: string;
  productName: string;
  onWriteReview?: () => void;
}

// ─── Sort Options Config ──────────────────────────────────────

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Most Recent' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest', label: 'Lowest Rated' },
];

const REVIEWS_PER_PAGE = 10;

// ─── Sub-Components ───────────────────────────────────────────

function RatingSummary({
  stats,
  filterRating,
  onFilterRating,
  onWriteReview,
}: {
  stats: ReviewStats;
  filterRating: number | null;
  onFilterRating: (rating: number | null) => void;
  onWriteReview?: () => void;
}) {
  const average = stats.average_rating?.toFixed(1) || '0.0';
  const total = stats.review_count || 0;

  const breakdown = [
    { stars: 5, count: stats.five_star || 0 },
    { stars: 4, count: stats.four_star || 0 },
    { stars: 3, count: stats.three_star || 0 },
    { stars: 2, count: stats.two_star || 0 },
    { stars: 1, count: stats.one_star || 0 },
  ].map((r) => ({
    ...r,
    percentage: total > 0 ? (r.count / total) * 100 : 0,
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Left: Overall Score */}
        <div className="flex flex-col items-center sm:items-start gap-2 sm:min-w-[140px]">
          <span className="text-4xl font-bold text-brand-dark">{average}</span>
          <StarRating rating={parseFloat(average)} size="md" />
          <span className="text-sm text-gray-500">
            Based on {total} review{total !== 1 ? 's' : ''}
          </span>
          {onWriteReview && (
            <button
              type="button"
              onClick={onWriteReview}
              className="mt-2 px-5 py-2 border-2 border-brand text-brand text-sm font-medium rounded-full hover:bg-brand hover:text-white transition-colors duration-200 cursor-pointer bg-transparent"
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Right: Rating Breakdown */}
        <div className="flex-1 space-y-1.5">
          {breakdown.map(({ stars, count, percentage }) => {
            const isActive = filterRating === stars;
            return (
              <button
                key={stars}
                type="button"
                className={`w-full flex items-center gap-2.5 py-1 group cursor-pointer bg-transparent border-none text-left transition-opacity duration-150 ${
                  isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                }`}
                onClick={() => onFilterRating(isActive ? null : stars)}
                aria-label={`Filter by ${stars} star reviews (${count})`}
              >
                <span className="text-xs text-gray-500 w-6 flex-shrink-0 text-right">
                  {stars}&#9733;
                </span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isActive ? 'bg-brand' : 'bg-amber-400'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8 flex-shrink-0 text-right">{count}</span>
              </button>
            );
          })}
          {filterRating !== null && (
            <button
              type="button"
              onClick={() => onFilterRating(null)}
              className="text-xs text-brand hover:text-brand-dark transition-colors cursor-pointer bg-transparent border-none mt-1"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SortDropdown({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (sort: SortOption) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="reviews-sort" className="text-sm text-gray-500">
        Sort by:
      </label>
      <select
        id="reviews-sort"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="text-sm font-medium text-brand-dark bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function EmptyState({ onWriteReview, filterRating }: { onWriteReview?: () => void; filterRating?: number | null }) {
  const isFiltered = filterRating !== null && filterRating !== undefined;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
      <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
          {isFiltered ? (
            <>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </>
          ) : (
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          )}
        </svg>
      </div>
      <h3 className="text-lg font-serif text-brand-dark mb-2">
        {isFiltered ? 'No Matching Reviews' : 'No Reviews Yet'}
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        {isFiltered
          ? `No reviews with ${filterRating} star${filterRating !== 1 ? 's' : ''} found for this product.`
          : 'Be the first to share your experience with this product.'}
      </p>
      {!isFiltered && onWriteReview && (
        <button
          type="button"
          onClick={onWriteReview}
          className="px-6 py-2.5 bg-brand text-white text-sm font-medium rounded-full hover:bg-brand-dark transition-colors duration-200 cursor-pointer border-none"
        >
          Write a Review
        </button>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className="w-7 h-7 border-2 border-gray-200 border-t-brand rounded-full animate-spin" />
      <span className="text-sm text-gray-400">Loading reviews...</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────

export default function ReviewsList({
  productSlug,
  productName,
  onWriteReview,
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sort, setSort] = useState<SortOption>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isFirstLoad = useRef(true);

  const fetchReviews = useCallback(
    async (page: number, append: boolean) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const params = new URLSearchParams({
          page: String(page),
          limit: String(REVIEWS_PER_PAGE),
          sort,
        });
        if (filterRating !== null) {
          params.set('rating', String(filterRating));
        }

        const response = await fetch(`/api/reviews/${productSlug}?${params}`);
        if (!response.ok) throw new Error('Failed to fetch reviews');

        const data = await response.json();

        if (append) {
          setReviews((prev) => [...prev, ...(data.reviews || [])]);
        } else {
          setReviews(data.reviews || []);
        }
        setStats(data.stats || null);
        setPagination(data.pagination || null);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
        setError('Unable to load reviews. Please try again.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [productSlug, sort, filterRating],
  );

  // Initial fetch and re-fetch on sort/filter change
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
    }
    fetchReviews(1, false);
  }, [fetchReviews]);

  const handleLoadMore = () => {
    if (pagination && pagination.page < pagination.totalPages) {
      fetchReviews(pagination.page + 1, true);
    }
  };

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
  };

  const handleFilterRating = (rating: number | null) => {
    setFilterRating(rating);
  };

  const hasMore = pagination ? pagination.page < pagination.totalPages : false;
  const totalReviews = stats?.review_count || 0;
  const showSortBar = totalReviews > 0 || filterRating !== null;

  return (
    <section id="reviews" data-pdp="reviews" className="space-y-5">
      {/* Section Title */}
      <h2 className="text-2xl md:text-3xl font-serif text-brand-dark">Customer Reviews</h2>

      {/* Rating Summary */}
      {stats && totalReviews > 0 && (
        <RatingSummary
          stats={stats}
          filterRating={filterRating}
          onFilterRating={handleFilterRating}
          onWriteReview={onWriteReview}
        />
      )}

      {/* Sort Bar */}
      {showSortBar && !loading && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SortDropdown value={sort} onChange={handleSortChange} />
          {filterRating !== null && (
            <span className="text-sm text-gray-500">
              Showing {reviews.length} of {pagination?.total || 0} review{(pagination?.total || 0) !== 1 ? 's' : ''} with {filterRating}&#9733;
            </span>
          )}
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6 text-center">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button
            type="button"
            onClick={() => fetchReviews(1, false)}
            className="text-sm text-brand hover:text-brand-dark transition-colors cursor-pointer bg-transparent border-none font-medium"
          >
            Try Again
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState onWriteReview={onWriteReview} filterRating={filterRating} />
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && !loading && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-8 py-2.5 border-2 border-gray-200 text-sm font-medium text-gray-600 rounded-full hover:border-brand hover:text-brand transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-transparent"
          >
            {loadingMore ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-gray-300 border-t-brand rounded-full animate-spin" />
                Loading...
              </span>
            ) : (
              'Load More Reviews'
            )}
          </button>
        </div>
      )}
    </section>
  );
}
