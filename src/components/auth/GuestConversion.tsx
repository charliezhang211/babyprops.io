/**
 * GuestConversion - React Island Component
 * Allows guest checkout users to create an account
 * Their orders will be automatically associated with the new account
 */

import { useState } from 'react';
import { signUp } from '@/stores/auth';

interface GuestConversionProps {
  email: string;
  orderId?: string;
}

export default function GuestConversion({ email, orderId }: GuestConversionProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp(email, password, fullName);

      if (result.success) {
        setSuccess(true);

        // Migrate guest orders to user account (via API)
        if (orderId) {
          try {
            await fetch('/api/account/migrate-orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
            });
          } catch (err) {
            console.error('Order migration failed:', err);
            // Not critical - orders can still be found by email
          }
        }
      } else {
        setError(result.error || 'Failed to create account');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="guest-conversion success">
        <div className="conversion-icon success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3>Account Created!</h3>
        <p>
          Check your email ({email}) to verify your account.
          Once verified, you can sign in to view your orders and save addresses.
        </p>
        <a href="/auth/login/" className="btn-conversion">Sign In Now</a>

        <style>{`
          .guest-conversion.success {
            background: var(--carbon-gray);
            border-radius: var(--radius-lg);
            padding: 24px;
            text-align: center;
          }

          .conversion-icon.success {
            color: var(--success-green);
            margin-bottom: 16px;
          }

          .guest-conversion.success h3 {
            font-family: var(--font-heading);
            font-size: 18px;
            color: var(--pure-white);
            margin-bottom: 8px;
          }

          .guest-conversion.success p {
            color: var(--silver);
            font-size: 14px;
            margin-bottom: 16px;
          }

          .btn-conversion {
            display: inline-block;
            background: var(--racing-red);
            color: var(--pure-white);
            padding: 12px 24px;
            font-family: var(--font-heading);
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            border-radius: var(--radius-md);
            text-decoration: none;
            transition: background 0.2s;
          }

          .btn-conversion:hover {
            background: var(--bright-red);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="guest-conversion">
      <div className="conversion-header">
        <div className="conversion-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
            <line x1="12" y1="11" x2="12" y2="17" />
            <line x1="9" y1="14" x2="15" y2="14" />
          </svg>
        </div>
        <div>
          <h3>Create an Account</h3>
          <p>Save your info for faster checkout next time and easily track your orders.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="conversion-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            disabled
            className="disabled"
          />
        </div>

        <div className="form-group">
          <label htmlFor="fullName">Full Name (optional)</label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            disabled={isLoading}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              minLength={8}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              minLength={8}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {error && (
          <div className="conversion-error">{error}</div>
        )}

        <button
          type="submit"
          className="btn-create-account"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className="conversion-note">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>

      <style>{`
        .guest-conversion {
          background: var(--carbon-gray);
          border: 1px solid var(--asphalt);
          border-radius: var(--radius-lg);
          padding: 24px;
          text-align: left;
        }

        .conversion-header {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
        }

        .conversion-icon {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          background: var(--asphalt);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--racing-red);
        }

        .conversion-header h3 {
          font-family: var(--font-heading);
          font-size: 18px;
          color: var(--pure-white);
          margin-bottom: 4px;
        }

        .conversion-header p {
          color: var(--silver);
          font-size: 14px;
          margin: 0;
        }

        .conversion-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 480px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }

        .form-group label {
          font-size: 14px;
          color: var(--silver);
        }

        .form-group input {
          background: var(--asphalt);
          border: 1px solid transparent;
          border-radius: var(--radius-md);
          padding: 12px 16px;
          font-size: 14px;
          color: var(--pure-white);
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--racing-red);
        }

        .form-group input.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-group input::placeholder {
          color: var(--graphite);
        }

        .conversion-error {
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid var(--racing-red);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          color: var(--racing-red);
          font-size: 14px;
        }

        .btn-create-account {
          background: var(--racing-red);
          color: var(--pure-white);
          border: none;
          border-radius: var(--radius-md);
          padding: 14px 24px;
          font-family: var(--font-heading);
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-create-account:hover:not(:disabled) {
          background: var(--bright-red);
        }

        .btn-create-account:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .conversion-note {
          font-size: 12px;
          color: var(--graphite);
          text-align: center;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
