/**
 * Admin Reviews Manager
 * React component for moderating reviews
 */

import { useState, useEffect } from 'react';

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
  status: string;
  admin_response?: string;
  created_at: string;
}

interface Summary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function ReviewsManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Response modal
  const [respondingTo, setRespondingTo] = useState<Review | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [updating, setUpdating] = useState(false);

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', page.toString());
      if (statusFilter) params.set('status', statusFilter);

      const response = await fetch(`/api/admin/reviews?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reviews');
      }

      setReviews(data.reviews);
      setSummary(data.summary);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  // Update review status
  const handleUpdateStatus = async (reviewId: string, status: string) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update review');
      }

      await fetchReviews();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update review');
    } finally {
      setUpdating(false);
    }
  };

  // Submit admin response
  const handleSubmitResponse = async () => {
    if (!respondingTo) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/reviews/${respondingTo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_response: adminResponse,
          status: 'approved', // Auto-approve when responding
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit response');
      }

      setRespondingTo(null);
      setAdminResponse('');
      await fetchReviews();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit response');
    } finally {
      setUpdating(false);
    }
  };

  // Delete review
  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete review');
      }

      await fetchReviews();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete review');
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, statusFilter]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (error) {
    return (
      <div className="admin-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="reviews-manager">
      {/* Summary */}
      {summary && (
        <div className="summary-cards">
          <button
            className={`summary-card ${statusFilter === '' ? 'active' : ''}`}
            onClick={() => { setStatusFilter(''); setPage(1); }}
          >
            <span className="summary-value">{summary.total}</span>
            <span className="summary-label">Total</span>
          </button>
          <button
            className={`summary-card ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('pending'); setPage(1); }}
          >
            <span className="summary-value">{summary.pending}</span>
            <span className="summary-label">Pending</span>
          </button>
          <button
            className={`summary-card ${statusFilter === 'approved' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('approved'); setPage(1); }}
          >
            <span className="summary-value">{summary.approved}</span>
            <span className="summary-label">Approved</span>
          </button>
          <button
            className={`summary-card ${statusFilter === 'rejected' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('rejected'); setPage(1); }}
          >
            <span className="summary-value">{summary.rejected}</span>
            <span className="summary-label">Rejected</span>
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div className="reviews-list">
        {loading ? (
          <div className="loading">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="no-data">No reviews found</div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="review-meta">
                  <span className="product-slug">{review.product_slug}</span>
                  <span className="review-rating" style={{ color: '#FFD700' }}>
                    {renderStars(review.rating)}
                  </span>
                  {review.verified_purchase && (
                    <span className="verified-badge">Verified Purchase</span>
                  )}
                </div>
                <span className="review-date">{formatDate(review.created_at)}</span>
              </div>

              <div className="reviewer-info">
                <strong>{review.reviewer_name}</strong>
                <span>{review.reviewer_email}</span>
              </div>

              {review.title && <h4 className="review-title">{review.title}</h4>}
              <p className="review-content">{review.content}</p>

              {review.images && review.images.length > 0 && (
                <div className="review-images">
                  {review.images.map((img, i) => (
                    <img key={i} src={img} alt={`Review image ${i + 1}`} />
                  ))}
                </div>
              )}

              {review.admin_response && (
                <div className="admin-response">
                  <strong>Your Response:</strong>
                  <p>{review.admin_response}</p>
                </div>
              )}

              <div className="review-actions">
                {review.status === 'pending' && (
                  <>
                    <button
                      className="approve-btn"
                      onClick={() => handleUpdateStatus(review.id, 'approved')}
                      disabled={updating}
                    >
                      Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleUpdateStatus(review.id, 'rejected')}
                      disabled={updating}
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  className="respond-btn"
                  onClick={() => {
                    setRespondingTo(review);
                    setAdminResponse(review.admin_response || '');
                  }}
                >
                  {review.admin_response ? 'Edit Response' : 'Respond'}
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(review.id)}
                >
                  Delete
                </button>
                <span className={`status-tag status-${review.status}`}>
                  {review.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      {/* Response Modal */}
      {respondingTo && (
        <div className="modal-overlay" onClick={() => setRespondingTo(null)}>
          <div className="modal response-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setRespondingTo(null)}>×</button>

            <h2>Respond to Review</h2>

            <div className="review-preview">
              <div className="review-rating" style={{ color: '#FFD700' }}>
                {renderStars(respondingTo.rating)}
              </div>
              <p><strong>{respondingTo.reviewer_name}</strong> on <em>{respondingTo.product_slug}</em></p>
              <p className="review-content">{respondingTo.content}</p>
            </div>

            <div className="response-form">
              <label>
                Your Response:
                <textarea
                  value={adminResponse}
                  onChange={e => setAdminResponse(e.target.value)}
                  rows={4}
                  placeholder="Write your response to this review..."
                />
              </label>

              <div className="form-actions">
                <button
                  className="submit-btn"
                  onClick={handleSubmitResponse}
                  disabled={updating || !adminResponse.trim()}
                >
                  {updating ? 'Submitting...' : 'Submit Response & Approve'}
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setRespondingTo(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
