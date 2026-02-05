/**
 * ResetPasswordForm - React Island Component
 * Handles setting new password after reset request
 */

import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { updatePassword, authLoading, authError, initAuth } from '@/stores/auth';

export default function ResetPasswordForm() {
  const isLoading = useStore(authLoading);
  const error = useStore(authError);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    initAuth();
  }, []);

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(pass)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(pass)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(pass)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!password || !confirmPassword) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setLocalError(passwordError);
      return;
    }

    const result = await updatePassword(password);

    if (result.success) {
      setSuccess(true);
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = '/account/';
      }, 2000);
    }
  };

  const displayError = localError || error;

  if (success) {
    return (
      <div className="auth-form">
        <div className="auth-message success">
          <strong>Password updated!</strong>
          <p style={{ marginTop: '8px' }}>
            Your password has been changed successfully. Redirecting to your account...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {displayError && (
        <div className="auth-message error">
          {displayError}
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="password">
          New Password
        </label>
        <div className="password-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            className="form-input"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        <p className="form-error" style={{ color: 'var(--graphite)', marginTop: '4px' }}>
          Min 8 characters with uppercase, lowercase, and number
        </p>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="confirmPassword">
          Confirm New Password
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          id="confirmPassword"
          className="form-input"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          autoComplete="new-password"
        />
      </div>

      <button
        type="submit"
        className="auth-submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="auth-spinner" />
            Updating...
          </>
        ) : (
          'Update Password'
        )}
      </button>
    </form>
  );
}
