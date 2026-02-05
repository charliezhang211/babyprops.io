/**
 * Admin Orders Manager
 * React component for managing orders
 */

import { useState, useEffect } from 'react';

interface Order {
  id: string;
  order_number: string;
  email: string;
  status: string;
  payment_status: string;
  total: number;
  shipping_address: {
    full_name?: string;
    country?: string;
  };
  created_at: string;
  paid_at?: string;
  shipped_at?: string;
  item_count: number;
}

interface OrderDetail extends Order {
  subtotal: number;
  shipping_cost: number;
  tax: number;
  discount: number;
  customer_note?: string;
  internal_note?: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  sku: string;
  name: string;
  variant?: string;
  color?: string;
  size?: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  image?: string;
}

interface Summary {
  total_orders: number;
  pending: number;
  paid: number;
  shipped: number;
  total_revenue: number;
}

const STATUS_OPTIONS = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const PAYMENT_STATUS_OPTIONS = ['unpaid', 'paid', 'refunded', 'partial_refund'];

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Selected order detail
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Update form
  const [updateStatus, setUpdateStatus] = useState('');
  const [updatePaymentStatus, setUpdatePaymentStatus] = useState('');
  const [updateNote, setUpdateNote] = useState('');
  const [updating, setUpdating] = useState(false);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', page.toString());
      if (statusFilter) params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`/api/admin/orders?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }

      setOrders(data.orders);
      setSummary(data.summary);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch order detail
  const fetchOrderDetail = async (orderId: string) => {
    try {
      setDetailLoading(true);
      const response = await fetch(`/api/admin/orders/${orderId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch order');
      }

      setSelectedOrder(data.order);
      setUpdateStatus(data.order.status);
      setUpdatePaymentStatus(data.order.payment_status);
      setUpdateNote(data.order.internal_note || '');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setDetailLoading(false);
    }
  };

  // Update order
  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updateStatus,
          payment_status: updatePaymentStatus,
          internal_note: updateNote,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order');
      }

      // Refresh order detail and list
      await fetchOrderDetail(selectedOrder.id);
      await fetchOrders();
      alert('Order updated successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#FFA500',
      paid: '#4CAF50',
      processing: '#2196F3',
      shipped: '#9C27B0',
      delivered: '#4CAF50',
      cancelled: '#F44336',
      refunded: '#F44336',
    };
    return colors[status] || '#888';
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
    <div className="orders-manager">
      {/* Summary Stats */}
      {summary && (
        <div className="summary-cards">
          <div className="summary-card">
            <span className="summary-value">{summary.total_orders}</span>
            <span className="summary-label">Total Orders</span>
          </div>
          <div className="summary-card">
            <span className="summary-value">{summary.pending}</span>
            <span className="summary-label">Pending</span>
          </div>
          <div className="summary-card">
            <span className="summary-value">{summary.paid}</span>
            <span className="summary-label">Paid</span>
          </div>
          <div className="summary-card">
            <span className="summary-value">{summary.shipped}</span>
            <span className="summary-label">Shipped</span>
          </div>
          <div className="summary-card highlight">
            <span className="summary-value">${summary.total_revenue.toFixed(2)}</span>
            <span className="summary-label">Revenue</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search order # or email..."
          />
          <button type="submit">Search</button>
        </form>

        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="orders-table-wrapper">
        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="no-data">No orders found</div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="order-number">{order.order_number}</td>
                  <td>
                    <div className="customer-info">
                      <span>{order.shipping_address?.full_name || 'N/A'}</span>
                      <small>{order.email}</small>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(order.payment_status === 'paid' ? 'paid' : 'pending') }}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="order-total">${Number(order.total).toFixed(2)}</td>
                  <td className="order-date">{formatDate(order.created_at)}</td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => fetchOrderDetail(order.id)}
                    >
                      View
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedOrder(null)}>×</button>

            {detailLoading ? (
              <div className="loading">Loading order details...</div>
            ) : (
              <>
                <h2>Order {selectedOrder.order_number}</h2>

                <div className="order-detail-grid">
                  <div className="detail-section">
                    <h3>Customer</h3>
                    <p><strong>Name:</strong> {selectedOrder.shipping_address?.full_name}</p>
                    <p><strong>Email:</strong> {selectedOrder.email}</p>
                    <p><strong>Country:</strong> {selectedOrder.shipping_address?.country}</p>
                    {selectedOrder.customer_note && (
                      <p><strong>Note:</strong> {selectedOrder.customer_note}</p>
                    )}
                  </div>

                  <div className="detail-section">
                    <h3>Order Info</h3>
                    <p><strong>Created:</strong> {formatDate(selectedOrder.created_at)}</p>
                    {selectedOrder.paid_at && <p><strong>Paid:</strong> {formatDate(selectedOrder.paid_at)}</p>}
                    {selectedOrder.shipped_at && <p><strong>Shipped:</strong> {formatDate(selectedOrder.shipped_at)}</p>}
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Items ({selectedOrder.items.length})</h3>
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map(item => (
                        <tr key={item.id}>
                          <td>
                            {item.name}
                            {item.variant && <small> - {item.variant}</small>}
                            {item.color && <small> ({item.color})</small>}
                          </td>
                          <td>{item.sku}</td>
                          <td>${Number(item.unit_price).toFixed(2)}</td>
                          <td>{item.quantity}</td>
                          <td>${Number(item.line_total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="order-totals">
                    <p>Subtotal: ${Number(selectedOrder.subtotal).toFixed(2)}</p>
                    <p>Shipping: ${Number(selectedOrder.shipping_cost).toFixed(2)}</p>
                    {Number(selectedOrder.discount) > 0 && <p>Discount: -${Number(selectedOrder.discount).toFixed(2)}</p>}
                    <p className="grand-total">Total: ${Number(selectedOrder.total).toFixed(2)}</p>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Update Order</h3>
                  <div className="update-form">
                    <div className="form-row">
                      <label>
                        Status:
                        <select value={updateStatus} onChange={e => setUpdateStatus(e.target.value)}>
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </label>

                      <label>
                        Payment:
                        <select value={updatePaymentStatus} onChange={e => setUpdatePaymentStatus(e.target.value)}>
                          {PAYMENT_STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label>
                      Internal Note:
                      <textarea
                        value={updateNote}
                        onChange={e => setUpdateNote(e.target.value)}
                        rows={3}
                        placeholder="Add internal notes..."
                      />
                    </label>

                    <button
                      className="update-btn"
                      onClick={handleUpdateOrder}
                      disabled={updating}
                    >
                      {updating ? 'Updating...' : 'Update Order'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
