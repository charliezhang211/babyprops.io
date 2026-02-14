/**
 * Payment Module
 * Unified payment provider registry and factory
 */

import type {
  PaymentMethodId,
  PaymentMethodConfig,
  PaymentProvider,
  PaymentOrderData,
  CreatePaymentResult,
  CapturePaymentResult,
  RefundPaymentResult,
} from './types';

import { paypalProvider } from './providers/paypal';
import { stripeProvider } from './providers/stripe';
import { bankTransferProvider } from './providers/bank-transfer';

// Re-export types
export * from './types';

// ============================================
// Payment Method Configurations
// ============================================

const PAYMENT_METHOD_CONFIGS: Record<PaymentMethodId, PaymentMethodConfig> = {
  paypal: {
    id: 'paypal',
    name: 'PayPal',
    description: 'Pay securely with PayPal or credit/debit card',
    icon: '/images/payments/paypal.svg',
    enabled: true,
    requiredEnvVars: ['PUBLIC_PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'],
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
    supportsImmediateCapture: true,
    requiresRedirect: false,
    sortOrder: 1,
  },
  stripe: {
    id: 'stripe',
    name: 'Credit Card',
    description: 'Pay with Visa, Mastercard, or American Express',
    icon: '/images/payments/stripe.svg',
    enabled: true,
    requiredEnvVars: ['STRIPE_SECRET_KEY', 'PUBLIC_STRIPE_PUBLISHABLE_KEY'],
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY'],
    supportsImmediateCapture: true,
    requiresRedirect: true,
    sortOrder: 2,
  },
  bank_transfer: {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    description: 'Pay via direct bank transfer (manual confirmation)',
    icon: '/images/payments/bank.svg',
    enabled: true,
    requiredEnvVars: ['ENABLE_BANK_TRANSFER', 'BANK_ACCOUNT_NUMBER'],
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    supportsImmediateCapture: false,
    requiresRedirect: false,
    sortOrder: 3,
  },
  cod: {
    id: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay when your order arrives',
    icon: '/images/payments/cod.svg',
    enabled: false, // Disabled by default
    requiredEnvVars: ['ENABLE_COD'],
    supportedCurrencies: ['USD'],
    supportsImmediateCapture: false,
    requiresRedirect: false,
    sortOrder: 4,
  },
};

// ============================================
// Provider Registry
// ============================================

const providers = new Map<PaymentMethodId, PaymentProvider>([
  ['paypal', paypalProvider],
  ['stripe', stripeProvider],
  ['bank_transfer', bankTransferProvider],
]);

// ============================================
// Public API
// ============================================

/**
 * Get all available (configured and enabled) payment methods
 */
export function getAvailablePaymentMethods(): PaymentMethodConfig[] {
  return Object.values(PAYMENT_METHOD_CONFIGS)
    .filter(config => {
      if (!config.enabled) return false;
      const provider = providers.get(config.id);
      return provider?.isConfigured() ?? false;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get all payment method configs (including disabled ones)
 */
export function getAllPaymentMethods(): PaymentMethodConfig[] {
  return Object.values(PAYMENT_METHOD_CONFIGS).sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get a specific payment method config
 */
export function getPaymentMethodConfig(id: PaymentMethodId): PaymentMethodConfig | null {
  return PAYMENT_METHOD_CONFIGS[id] || null;
}

/**
 * Get a payment provider by ID
 */
export function getPaymentProvider(id: PaymentMethodId): PaymentProvider | null {
  return providers.get(id) || null;
}

/**
 * Check if a payment method is available
 */
export function isPaymentMethodAvailable(id: PaymentMethodId): boolean {
  const config = PAYMENT_METHOD_CONFIGS[id];
  if (!config?.enabled) return false;
  const provider = providers.get(id);
  return provider?.isConfigured() ?? false;
}

/**
 * Create a payment using specified method
 */
export async function createPayment(
  methodId: PaymentMethodId,
  data: PaymentOrderData
): Promise<CreatePaymentResult> {
  const provider = providers.get(methodId);
  if (!provider) {
    return { success: false, error: `Unknown payment method: ${methodId}` };
  }
  if (!provider.isConfigured()) {
    return { success: false, error: `Payment method ${methodId} is not configured` };
  }
  return provider.createPayment(data);
}

/**
 * Capture a payment
 */
export async function capturePayment(
  methodId: PaymentMethodId,
  externalPaymentId: string
): Promise<CapturePaymentResult> {
  const provider = providers.get(methodId);
  if (!provider) {
    return { success: false, error: `Unknown payment method: ${methodId}` };
  }
  return provider.capturePayment(externalPaymentId);
}

/**
 * Refund a payment
 */
export async function refundPayment(
  methodId: PaymentMethodId,
  transactionId: string,
  amount?: number
): Promise<RefundPaymentResult> {
  const provider = providers.get(methodId);
  if (!provider) {
    return { success: false, error: `Unknown payment method: ${methodId}` };
  }
  return provider.refundPayment(transactionId, amount);
}

// ============================================
// Client-side helpers
// ============================================

/**
 * Get payment methods for client-side rendering
 * (excludes sensitive info, returns only display data)
 */
export function getClientPaymentMethods(): Array<{
  id: PaymentMethodId;
  name: string;
  description: string;
  icon?: string;
  requiresRedirect: boolean;
}> {
  return getAvailablePaymentMethods().map(config => ({
    id: config.id,
    name: config.name,
    description: config.description,
    icon: config.icon,
    requiresRedirect: config.requiresRedirect,
  }));
}
