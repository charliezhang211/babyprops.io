// ReviewForm - Review submission form (React Island)
// Supports guest (name + email) and authenticated user modes
// Image upload via base64 data URLs (max 3)

import { useState, useRef, useCallback } from 'react';
import { useStore } from '@nanostores/react';
import { authUser, isAuthenticated, initAuth } from '@/stores/auth';
import StarRating from '@/components/reviews/StarRating';

interface ReviewFormProps {
  productSlug: string;
  productName: string;
  onSubmitted?: () => void;
}

interface FormErrors {
  rating?: string;
  title?: string;
  content?: string;
  name?: string;
  email?: string;
  images?: string;
  submit?: string;
}

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ReviewForm({
  productSlug,
  productName,
  onSubmitted,
}: ReviewFormProps) {
  const user = useStore(authUser);
  const loggedIn = useStore(isAuthenticated);

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize auth on mount (safe to call multiple times)
  useState(() => { initAuth(); });

  const validate = useCallback((): FormErrors => {
    const errs: FormErrors = {};

    if (rating === 0) errs.rating = 'Please select a rating';
    if (!title.trim()) errs.title = 'Please enter a review title';
    if (content.trim().length < 20) {
      errs.content = `Review must be at least 20 characters (${content.trim().length}/20)`;
    }
    if (!loggedIn) {
      if (!guestName.trim()) errs.name = 'Please enter your name';
      if (!guestEmail.trim()) {
        errs.email = 'Please enter your email';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
        errs.email = 'Please enter a valid email address';
      }
    }

    return errs;
  }, [rating, title, content, loggedIn, guestName, guestEmail]);

  const handleImageAdd = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const remaining = MAX_IMAGES - images.length;
      if (remaining <= 0) return;

      const toProcess = Array.from(files).slice(0, remaining);
      let imageError = '';

      toProcess.forEach((file) => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          imageError = 'Only JPEG, PNG, and WebP images are accepted';
          return;
        }
        if (file.size > MAX_IMAGE_SIZE) {
          imageError = 'Each image must be under 2MB';
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          setImages((prev) => {
            if (prev.length >= MAX_IMAGES) return prev;
            return [...prev, result];
          });
        };
        reader.readAsDataURL(file);
      });

      if (imageError) {
        setErrors((prev) => ({ ...prev, images: imageError }));
      } else {
        setErrors((prev) => {
          const { images: _, ...rest } = prev;
          return rest;
        });
      }

      // Reset input so the same file can be re-selected
      e.target.value = '';
    },
    [images.length],
  );

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);

    const reviewerName = loggedIn
      ? user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
      : guestName.trim();
    const reviewerEmail = loggedIn
      ? user?.email || ''
      : guestEmail.trim();

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_slug: productSlug,
          rating,
          title: title.trim(),
          content: content.trim(),
          reviewer_name: reviewerName,
          reviewer_email: reviewerEmail,
          images: images.length > 0 ? images : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ submit: data.error || 'Failed to submit review' });
        return;
      }

      setSubmitted(true);
      onSubmitted?.();
    } catch {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Success State ──────────────────────────────────────────

  if (submitted) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-brand-accent/30 p-8 text-center" data-component="review-form">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-brand-accent/20 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-accent">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3 className="text-lg font-serif text-brand-dark mb-2">Thank You!</h3>
        <p className="text-sm text-gray-500">
          Your review has been submitted and is pending approval. It will appear on the product page once approved.
        </p>
      </div>
    );
  }

  // ─── Form ───────────────────────────────────────────────────

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6 space-y-5"
      data-component="review-form"
      noValidate
    >
      <h3 className="text-xl font-serif text-brand-dark">Write a Review</h3>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Your Rating <span className="text-red-400">*</span>
        </label>
        <StarRating rating={rating} readonly={false} size="lg" onChange={setRating} />
        {errors.rating && <p className="text-xs text-red-500 mt-1">{errors.rating}</p>}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="review-title" className="block text-sm font-medium text-gray-700 mb-1.5">
          Review Title <span className="text-red-400">*</span>
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='e.g., "Amazing quality and fast shipping"'
          maxLength={120}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
      </div>

      {/* Content */}
      <div>
        <label htmlFor="review-content" className="block text-sm font-medium text-gray-700 mb-1.5">
          Your Review <span className="text-red-400">*</span>
        </label>
        <textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={4}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-vertical"
        />
        <div className="flex items-center justify-between mt-1">
          {errors.content ? (
            <p className="text-xs text-red-500">{errors.content}</p>
          ) : (
            <p className="text-xs text-gray-400">Min 20 characters</p>
          )}
          <span className="text-xs text-gray-400">{content.trim().length}</span>
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Add Photos <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <div className="flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
              <img src={img} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveImage(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none"
                aria-label={`Remove image ${i + 1}`}
              >
                &times;
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={handleImageAdd}
              className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-brand hover:text-brand transition-colors cursor-pointer bg-transparent"
              aria-label="Add photo"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="text-[10px] mt-0.5">Photo</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-xs text-gray-400 mt-1">Max {MAX_IMAGES} images, JPEG/PNG/WebP, under 2MB each</p>
        {errors.images && <p className="text-xs text-red-500 mt-1">{errors.images}</p>}
      </div>

      {/* Guest Fields */}
      {!loggedIn && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="review-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Your Name <span className="text-red-400">*</span>
            </label>
            <input
              id="review-name"
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g., Sarah M."
              maxLength={50}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="review-email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Your Email <span className="text-red-400">*</span>
            </label>
            <input
              id="review-email"
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="your@email.com"
              maxLength={100}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            <p className="text-xs text-gray-400 mt-1">Your email won't be published</p>
          </div>
        </div>
      )}

      {/* Submit Error */}
      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Submit Button + Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-brand text-white text-sm font-medium rounded-full hover:bg-brand-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            'Submit Review'
          )}
        </button>
        <p className="text-xs text-gray-400">
          Your review will be published after approval.
        </p>
      </div>
    </form>
  );
}
