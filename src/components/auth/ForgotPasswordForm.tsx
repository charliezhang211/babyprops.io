/**
 * ForgotPasswordForm - React Island Component
 * Handles password reset request
 */

import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { resetPassword, authLoading, authError, initAuth } from '@/stores/auth';

export default function ForgotPasswordForm() {
  const isLoading = useStore(authLoading);
  const error = useStore(authError);

  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    initAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email) {
      setLocalError('Please enter your email address');
      return;
    }

    const result = await resetPassword(email);

    if (result.success) {
      setSuccess(true);
    }
  };

  const displayError = localError || error;

  if (success) {
    return (
      <div className="auth-form">
        <div className="auth-message success">
          <strong>Check your email!</strong>
          <p style={{ marginTop: '8px' }}>
            We've sent password reset instructions to <strong>{email}</strong>.
          </p>
        </div>
        <div className="auth-footer">
          <p>
            Remember your password?{' '}
            <a href="/auth/login/">Sign in</a>
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

      <p style={{ color: 'var(--silver)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <div className="form-group">
        <label className="form-label" htmlFor="email">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          className={`form-input ${displayError ? 'error' : ''}`}
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          autoComplete="email"
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
            Sending...
          </>
        ) : (
          'Send Reset Link'
        )}
      </button>

      <div className="auth-footer">
        <p>
          Remember your password?{' '}
          <a href="/auth/login/">Sign in</a>
        </p>
      </div>
    </form>
  );
}
