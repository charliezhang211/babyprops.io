// ProductReviews - React Island Component
// Displays reviews and handles review submission with Supabase API

import { useState, useEffect, useRef } from 'react';

interface Review {
    id: string;
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

interface Props {
    productName: string;
    productSlug: string;
    initialReviews?: Review[];
    initialStats?: ReviewStats | null;
}

// Star Rating Component
function StarRating({ rating, size = 16, interactive = false, onChange }: {
    rating: number;
    size?: number;
    interactive?: boolean;
    onChange?: (rating: number) => void;
}) {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    className={`p-0 bg-transparent border-none ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
                    style={{ width: size, height: size }}
                    onMouseEnter={() => interactive && setHoverRating(star)}
                    onMouseLeave={() => interactive && setHoverRating(0)}
                    onClick={() => interactive && onChange?.(star)}
                    disabled={!interactive}
                >
                    <svg viewBox="0 0 24 24" fill={star <= (hoverRating || rating) ? '#FFD700' : 'none'} stroke="#FFD700" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                </button>
            ))}
        </div>
    );
}

// Review Card Component
function ReviewCard({ review }: { review: Review }) {
    const date = new Date(review.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return (
        <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
                        {review.reviewer_name[0]?.toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">{review.reviewer_name}</span>
                        {review.verified_purchase && (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                Verified Purchase
                            </span>
                        )}
                    </div>
                </div>
                <span className="text-xs text-slate-500 flex-shrink-0">{date}</span>
            </div>

            {/* Rating */}
            <StarRating rating={review.rating} size={14} />

            {/* Content */}
            {review.title && <h4 className="text-sm font-semibold text-white">{review.title}</h4>}
            <p className="text-sm text-slate-300 leading-relaxed">{review.content}</p>

            {/* Images */}
            {review.images && review.images.length > 0 && (
                <div className="flex gap-2 pt-1">
                    {review.images.map((img, index) => (
                        <img
                            key={index}
                            src={img}
                            alt={`Review image ${index + 1}`}
                            className="w-16 h-16 rounded-lg object-cover border border-slate-700"
                        />
                    ))}
                </div>
            )}

            {/* Admin Response */}
            {review.admin_response && (
                <div className="mt-3 p-3 bg-slate-700/30 border-l-2 border-brand rounded-r-lg">
                    <strong className="text-xs text-brand uppercase tracking-wide">Store Response:</strong>
                    <p className="text-sm text-slate-300 mt-1">{review.admin_response}</p>
                </div>
            )}
        </div>
    );
}

// Review Form Component
function ReviewForm({ productSlug, productName, onSubmit }: {
    productSlug: string;
    productName: string;
    onSubmit: () => void;
}) {
    const [rating, setRating] = useState(5);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).slice(0, 3).forEach(file => {
            if (file.size > 2 * 1024 * 1024) {
                setError('Image must be less than 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => [...prev.slice(0, 2), reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_slug: productSlug,
                    reviewer_name: name,
                    reviewer_email: email,
                    title: title || undefined,
                    content,
                    rating,
                    images: images.length > 0 ? images : undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit review');
            }

            setSuccess(true);
            setName('');
            setEmail('');
            setTitle('');
            setContent('');
            setRating(5);
            setImages([]);
            onSubmit();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <h3 className="text-lg font-semibold text-white">Thank you for your review!</h3>
                <p className="text-sm text-slate-400">Your review has been submitted and will appear after approval.</p>
            </div>
        );
    }

    return (
        <form className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl space-y-4" onSubmit={handleSubmit}>
            <h3 className="text-base font-semibold text-white">Write a Review</h3>

            <div className="space-y-1.5">
                <label className="block text-sm text-slate-300">Your Rating</label>
                <StarRating rating={rating} size={28} interactive onChange={setRating} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <label htmlFor="review-name" className="block text-sm text-slate-300">Name *</label>
                    <input
                        id="review-name"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Your name"
                        required
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors"
                    />
                </div>
                <div className="space-y-1.5">
                    <label htmlFor="review-email" className="block text-sm text-slate-300">Email *</label>
                    <input
                        id="review-email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label htmlFor="review-title" className="block text-sm text-slate-300">Review Title (Optional)</label>
                <input
                    id="review-title"
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Sum up your review in a few words"
                    maxLength={100}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors"
                />
            </div>

            <div className="space-y-1.5">
                <label htmlFor="review-text" className="block text-sm text-slate-300">Your Review *</label>
                <textarea
                    id="review-text"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder={`Share your experience with the ${productName}...`}
                    rows={4}
                    required
                    minLength={10}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors resize-y"
                />
            </div>

            <div className="space-y-1.5">
                <label className="block text-sm text-slate-300">Add Photos (Max 3)</label>
                <div className="flex flex-wrap gap-2">
                    {images.map((img, index) => (
                        <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-700">
                            <img src={img} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 w-5 h-5 bg-black/70 text-white rounded-full text-xs flex items-center justify-center hover:bg-brand transition-colors cursor-pointer"
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                    {images.length < 3 && (
                        <label className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-700 flex flex-col items-center justify-center gap-1 text-slate-500 hover:border-slate-500 hover:text-slate-400 transition-colors cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <path d="m21 15-5-5L5 21" />
                            </svg>
                            <span className="text-[10px]">Add Photo</span>
                        </label>
                    )}
                </div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
                type="submit"
                className="w-full py-2.5 bg-brand hover:bg-brand-dark text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
}

// Main Reviews Component
export default function ProductReviews({
    productName,
    productSlug,
    initialReviews = [],
    initialStats = null,
}: Props) {
    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    const [stats, setStats] = useState<ReviewStats | null>(initialStats);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState<number | null>(null);

    const fetchReviews = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const url = filter
                ? `/api/reviews/${productSlug}?rating=${filter}`
                : `/api/reviews/${productSlug}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch reviews');

            const data = await response.json();
            setReviews(data.reviews || []);
            setStats(data.stats || null);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const isFirstRender = useRef(true);
    const hasInitialData = initialReviews.length > 0 || initialStats !== null;

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            if (hasInitialData && filter === null) {
                return;
            }
        }
        fetchReviews(true);
    }, [filter]);

    const handleRefresh = () => {
        setFilter(null);
        fetchReviews(false);
    };

    const averageRating = stats?.average_rating?.toFixed(1) || '0';
    const reviewCount = stats?.review_count || 0;

    const ratingCounts = [
        { rating: 5, count: stats?.five_star || 0 },
        { rating: 4, count: stats?.four_star || 0 },
        { rating: 3, count: stats?.three_star || 0 },
        { rating: 2, count: stats?.two_star || 0 },
        { rating: 1, count: stats?.one_star || 0 },
    ].map(r => ({
        ...r,
        percentage: reviewCount ? (r.count / reviewCount) * 100 : 0
    }));

    return (
        <section id="reviews" data-pdp="reviews" className="space-y-6">
            <h2 className="text-xl font-heading text-white uppercase">Customer Reviews</h2>

            {/* Summary Header */}
            <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Score */}
                    <div className="flex items-center gap-3">
                        <span className="text-4xl font-bold text-white">{averageRating}</span>
                        <div className="flex flex-col gap-1">
                            <StarRating rating={parseFloat(averageRating)} size={18} />
                            <span className="text-xs text-slate-400">Based on {reviewCount} reviews</span>
                        </div>
                    </div>

                    {/* Breakdown Bars */}
                    <div className="flex-1 space-y-1.5">
                        {ratingCounts.map(({ rating, count, percentage }) => (
                            <button
                                key={rating}
                                className={`w-full flex items-center gap-2 py-0.5 group cursor-pointer bg-transparent border-none text-left ${
                                    filter === rating ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                                }`}
                                onClick={() => setFilter(filter === rating ? null : rating)}
                            >
                                <span className="text-xs text-slate-400 w-8 flex-shrink-0">{rating} &#9733;</span>
                                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-300 ${
                                            filter === rating ? 'bg-brand' : 'bg-amber-400'
                                        }`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span className="text-xs text-slate-500 w-6 text-right flex-shrink-0">{count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    className="w-full sm:w-auto px-5 py-2 border border-slate-600 text-sm font-medium text-white rounded-lg hover:border-brand hover:text-brand transition-colors cursor-pointer bg-transparent"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : 'Write a Review'}
                </button>
            </div>

            {/* Review Form */}
            {showForm && (
                <ReviewForm
                    productSlug={productSlug}
                    productName={productName}
                    onSubmit={() => {
                        setShowForm(false);
                        handleRefresh();
                    }}
                />
            )}

            {/* Reviews List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-10">
                        <div className="w-6 h-6 border-2 border-slate-600 border-t-brand rounded-full animate-spin" />
                        <span className="text-sm text-slate-400">Loading reviews...</span>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="text-sm text-slate-400">No reviews yet. Be the first to review this product!</p>
                    </div>
                ) : (
                    reviews.map(review => (
                        <ReviewCard key={review.id} review={review} />
                    ))
                )}
            </div>
        </section>
    );
}
