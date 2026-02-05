/**
 * AddressManager - React Island Component
 * Manages user addresses with CRUD operations
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import type { AddressRow } from '@/lib/supabase';

interface Props {
  initialAddresses: AddressRow[];
  userId: string;
}

interface AddressFormData {
  full_name: string;
  phone: string;
  email: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  label: string;
  is_default: boolean;
}

const emptyForm: AddressFormData = {
  full_name: '',
  phone: '',
  email: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'US',
  label: 'Home',
  is_default: false,
};

export default function AddressManager({ initialAddresses, userId }: Props) {
  const [addresses, setAddresses] = useState<AddressRow[]>(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const openAddForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError(null);
  };

  const openEditForm = (address: AddressRow) => {
    setFormData({
      full_name: address.full_name,
      phone: address.phone || '',
      email: address.email || '',
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      label: address.label,
      is_default: address.is_default,
    });
    setEditingId(address.id);
    setShowForm(true);
    setError(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (editingId) {
        // Update existing address
        const { data, error: updateError } = await supabase
          .from('addresses')
          .update({
            full_name: formData.full_name,
            phone: formData.phone || null,
            email: formData.email || null,
            address_line1: formData.address_line1,
            address_line2: formData.address_line2 || null,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postal_code,
            country: formData.country,
            label: formData.label,
            is_default: formData.is_default,
          })
          .eq('id', editingId)
          .select()
          .single();

        if (updateError) throw updateError;

        setAddresses(prev =>
          prev.map(addr => (addr.id === editingId ? data : addr))
        );
      } else {
        // Create new address
        const { data, error: insertError } = await supabase
          .from('addresses')
          .insert({
            user_id: userId,
            full_name: formData.full_name,
            phone: formData.phone || null,
            email: formData.email || null,
            address_line1: formData.address_line1,
            address_line2: formData.address_line2 || null,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postal_code,
            country: formData.country,
            label: formData.label,
            is_default: formData.is_default,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setAddresses(prev => [...prev, data]);
      }

      closeForm();
      // Refresh to update default status
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to save address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    setIsLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setAddresses(prev => prev.filter(addr => addr.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    setIsLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id);

      if (updateError) throw updateError;

      // Refresh to get updated data
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to set default address');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="auth-message error" style={{ marginBottom: 'var(--space-4)' }}>
          {error}
        </div>
      )}

      {showForm ? (
        <div className="account-card">
          <div className="account-card-header">
            <h2 className="account-card-title">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h2>
            <button
              onClick={closeForm}
              className="account-card-action"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="label">Label</label>
                <select
                  id="label"
                  name="label"
                  className="form-input"
                  value={formData.label}
                  onChange={handleInputChange}
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="full_name">Full Name *</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  className="form-input"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="address_line1">Address Line 1 *</label>
              <input
                type="text"
                id="address_line1"
                name="address_line1"
                className="form-input"
                value={formData.address_line1}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="address_line2">Address Line 2</label>
              <input
                type="text"
                id="address_line2"
                name="address_line2"
                className="form-input"
                placeholder="Apt, Suite, Unit, etc."
                value={formData.address_line2}
                onChange={handleInputChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  className="form-input"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="state">State *</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  className="form-input"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="postal_code">ZIP Code *</label>
                <input
                  type="text"
                  id="postal_code"
                  name="postal_code"
                  className="form-input"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <label className="form-checkbox">
              <input
                type="checkbox"
                name="is_default"
                checked={formData.is_default}
                onChange={handleInputChange}
              />
              <span>Set as default address</span>
            </label>

            <button
              type="submit"
              className="auth-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="auth-spinner" />
                  Saving...
                </>
              ) : (
                editingId ? 'Update Address' : 'Add Address'
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="addresses-grid">
          {addresses.map(address => (
            <div
              key={address.id}
              className={`address-card ${address.is_default ? 'default' : ''}`}
            >
              {address.is_default && (
                <span className="address-default-badge">Default</span>
              )}
              <div className="address-label">{address.label}</div>
              <div className="address-details">
                <strong>{address.full_name}</strong>
                <br />
                {address.address_line1}
                {address.address_line2 && <><br />{address.address_line2}</>}
                <br />
                {address.city}, {address.state} {address.postal_code}
                <br />
                {address.country}
                {address.phone && <><br />{address.phone}</>}
              </div>
              <div className="address-actions">
                <button
                  className="address-btn edit"
                  onClick={() => openEditForm(address)}
                  disabled={isLoading}
                >
                  Edit
                </button>
                {!address.is_default && (
                  <button
                    className="address-btn default"
                    onClick={() => handleSetDefault(address.id)}
                    disabled={isLoading}
                  >
                    Set Default
                  </button>
                )}
                <button
                  className="address-btn delete"
                  onClick={() => handleDelete(address.id)}
                  disabled={isLoading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          <button className="add-address-card" onClick={openAddForm}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add New Address</span>
          </button>
        </div>
      )}
    </div>
  );
}
