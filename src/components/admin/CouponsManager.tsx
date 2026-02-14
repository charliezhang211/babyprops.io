/**
 * Admin Coupons Manager
 * React component for managing discount/coupon codes
 */

import { useState, useEffect } from 'react';

interface Coupon {
  id: string;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  min_order: number;
  max_uses: number | null;
  used_count: number;
  valid_from: string;
  valid_to: string | null;
  is_active: boolean;
  created_at: string;
}

interface Summary {
  total: number;
  active: number;
  expired: number;
  total_uses: number;
}

const emptyCoupon: {
  code: string;
  type: 'fixed' | 'percentage';
  value: string;
  min_order: string;
  max_uses: string;
  valid_from: string;
  valid_to: string;
} = {
  code: '',
  type: 'percentage',
  value: '',
  min_order: '',
  max_uses: '',
  valid_from: '',
  valid_to: '',
};

export default function CouponsManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Create / Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCoupon);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', page.toString());
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/admin/coupons?${params}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch coupons');

      setCoupons(data.coupons);
      setSummary(data.summary);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, [page, statusFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyCoupon);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      min_order: coupon.min_order ? String(coupon.min_order) : '',
      max_uses: coupon.max_uses ? String(coupon.max_uses) : '',
      valid_from: coupon.valid_from ? coupon.valid_from.slice(0, 10) : '',
      valid_to: coupon.valid_to ? coupon.valid_to.slice(0, 10) : '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.value) {
      setFormError('Code and value are required');
      return;
    }

    try {
      setSaving(true);
      setFormError('');

      const payload = {
        code: form.code,
        type: form.type,
        value: form.value,
        min_order: form.min_order || '0',
        max_uses: form.max_uses || null,
        valid_from: form.valid_from || null,
        valid_to: form.valid_to || null,
      };

      const url = editingId ? `/api/admin/coupons/${editingId}` : '/api/admin/coupons';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save coupon');

      setShowModal(false);
      await fetchCoupons();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !coupon.is_active }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      await fetchCoupons();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      await fetchCoupons();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const formatDiscount = (coupon: Coupon) =>
    coupon.type === 'percentage' ? `${coupon.value}%` : `$${Number(coupon.value).toFixed(2)}`;

  const isExpired = (coupon: Coupon) =>
    !coupon.is_active || (coupon.valid_to && new Date(coupon.valid_to) < new Date());

  const isMaxed = (coupon: Coupon) =>
    coupon.max_uses && coupon.used_count >= coupon.max_uses;

  if (error) {
    return (
      <div className="admin-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="coupons-manager">
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
            className={`summary-card ${statusFilter === 'active' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('active'); setPage(1); }}
          >
            <span className="summary-value">{summary.active}</span>
            <span className="summary-label">Active</span>
          </button>
          <button
            className={`summary-card ${statusFilter === 'expired' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('expired'); setPage(1); }}
          >
            <span className="summary-value">{summary.expired}</span>
            <span className="summary-label">Expired</span>
          </button>
          <div className="summary-card highlight">
            <span className="summary-value">{summary.total_uses}</span>
            <span className="summary-label">Total Uses</span>
          </div>
        </div>
      )}

      {/* Actions bar */}
      <div className="filters">
        <button className="create-btn" onClick={openCreate}>+ New Coupon</button>
      </div>

      {/* Coupons Table */}
      <div className="orders-table-wrapper">
        {loading ? (
          <div className="loading">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="no-data">No coupons found</div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Usage</th>
                <th>Valid Period</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon.id} style={{ opacity: isExpired(coupon) ? 0.5 : 1 }}>
                  <td className="order-number">{coupon.code}</td>
                  <td>{formatDiscount(coupon)}</td>
                  <td>{coupon.min_order > 0 ? `$${Number(coupon.min_order).toFixed(2)}` : '—'}</td>
                  <td>
                    {coupon.used_count}{coupon.max_uses ? ` / ${coupon.max_uses}` : ''}
                    {isMaxed(coupon) && <small style={{ color: '#F44336', marginLeft: 4 }}>maxed</small>}
                  </td>
                  <td className="order-date">
                    {coupon.valid_from ? formatDate(coupon.valid_from) : '—'}
                    {' → '}
                    {coupon.valid_to ? formatDate(coupon.valid_to) : 'No expiry'}
                  </td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: isExpired(coupon) ? '#F44336' : '#4CAF50' }}
                    >
                      {isExpired(coupon) ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <button className="view-btn" onClick={() => openEdit(coupon)}>Edit</button>
                    <button
                      className="view-btn"
                      onClick={() => handleToggleActive(coupon)}
                      style={{ marginLeft: 4 }}
                    >
                      {coupon.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(coupon.id)}
                      style={{ marginLeft: 4 }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>

            <h2>{editingId ? 'Edit Coupon' : 'Create Coupon'}</h2>

            <div className="update-form">
              <div className="form-row">
                <label>
                  Code *
                  <input
                    type="text"
                    value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value })}
                    placeholder="e.g. WELCOME10"
                    style={{ textTransform: 'uppercase' }}
                  />
                </label>

                <label>
                  Type *
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as 'fixed' | 'percentage' })}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label>
                  {form.type === 'percentage' ? 'Discount (%)' : 'Discount ($)'} *
                  <input
                    type="number"
                    value={form.value}
                    onChange={e => setForm({ ...form, value: e.target.value })}
                    placeholder={form.type === 'percentage' ? '10' : '20.00'}
                    min="0"
                    max={form.type === 'percentage' ? '100' : undefined}
                    step={form.type === 'percentage' ? '1' : '0.01'}
                  />
                </label>

                <label>
                  Minimum Order ($)
                  <input
                    type="number"
                    value={form.min_order}
                    onChange={e => setForm({ ...form, min_order: e.target.value })}
                    placeholder="0 = no minimum"
                    min="0"
                    step="0.01"
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Max Uses
                  <input
                    type="number"
                    value={form.max_uses}
                    onChange={e => setForm({ ...form, max_uses: e.target.value })}
                    placeholder="Empty = unlimited"
                    min="1"
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Valid From
                  <input
                    type="date"
                    value={form.valid_from}
                    onChange={e => setForm({ ...form, valid_from: e.target.value })}
                  />
                </label>

                <label>
                  Valid To
                  <input
                    type="date"
                    value={form.valid_to}
                    onChange={e => setForm({ ...form, valid_to: e.target.value })}
                  />
                </label>
              </div>

              {formError && (
                <p style={{ color: '#F44336', fontSize: 14 }}>{formError}</p>
              )}

              <button className="update-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
