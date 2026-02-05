/**
 * RegisterForm - React Island Component
 * Handles new user registration
 */

import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { signUp, authLoading, authError, initAuth } from '@/stores/auth';

export default function RegisterForm() {
  const isLoading = useStore(authLoading);
  const error = useStore(authError);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
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

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
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

    if (!agreeTerms) {
      setLocalError('Please agree to the Terms of Service');
      return;
    }

    const result = await signUp(email, password, { full_name: fullName });

    if (result.success) {
      if (result.needsEmailConfirmation) {
        setSuccess(true);
      } else {
        // Direct login, redirect to account
        const redirect = new URLSearchParams(window.location.search).get('redirect') || '/account/';
        window.location.href = redirect;
      }
    }
  };

  const displayError = localError || error;

  if (success) {
    return (
      <div className="auth-form">
        <div className="auth-message success">
          <strong>Check your email!</strong>
          <p style={{ marginTop: '8px' }}>
            We've sent a confirmation link to <strong>{email}</strong>.
            Please click the link to activate your account.
          </p>
        </div>
        <div className="auth-footer">
          <p>
            Already confirmed?{' '}
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

      <div className="form-group">
        <label className="form-label" htmlFor="fullName">
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          className="form-input"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={isLoading}
          autoComplete="name"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="email">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          className="form-input"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          autoComplete="email"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="password">
          Password
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
          Confirm Password
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

      <label className="form-checkbox">
        <input
          type="checkbox"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          disabled={isLoading}
        />
        <span>
          I agree to the{' '}
          <a href="/terms/" target="_blank">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy/" target="_blank">Privacy Policy</a>
        </span>
      </label>

      <button
        type="submit"
        className="auth-submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="auth-spinner" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </button>

      <div className="auth-footer">
        <p>
          Already have an account?{' '}
          <a href="/auth/login/">Sign in</a>
        </p>
      </div>
    </form>
  );
}
