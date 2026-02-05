/**
 * Payment Provider Types
 * Unified interface for multiple payment methods
 */

// ============================================
// Core Types
// ============================================

export type PaymentMethodId = 'paypal' | 'stripe' | 'bank_transfer' | 'cod';

export interface PaymentMethodConfig {
  id: PaymentMethodId;
  name: string;
  description: string;
  icon?: string;
  enabled: boolean;
  // Environment variables needed for this method
  requiredEnvVars: string[];
  // Supported currencies
  supportedCurrencies: string[];
  // Whether this method supports immediate capture
  supportsImmediateCapture: boolean;
  // Whether this requires redirect (like Stripe Checkout)
  requiresRedirect: boolean;
  // Sort order for display
  sortOrder: number;
}

// ============================================
// Order Data for Payment
// ============================================

export interface PaymentOrderData {
  orderNumber: string;
  orderId: string;
  items: {
    name: string;
    sku: string;
    quantity: number;
    unit_price: number;
  }[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    countryCode: string;
    email: string;
    phone?: string;
  };
}

// ============================================
// Payment Results
// ============================================

export interface CreatePaymentResult {
  success: boolean;
  // External payment ID (PayPal order ID, Stripe session ID, etc.)
  externalPaymentId?: string;
  // Redirect URL for methods that need redirect
  redirectUrl?: string;
  // Client token for client-side SDKs
  clientToken?: string;
  // Error message if failed
  error?: string;
  // Additional metadata
  metadata?: Record<string, unknown>;
}

export interface CapturePaymentResult {
  success: boolean;
  // Transaction ID after capture
  transactionId?: string;
  // Captured amount
  amount?: number;
  currency?: string;
  // Payer info if available
  payerEmail?: string;
  payerName?: string;
  // Raw provider response for logging
  rawResponse?: unknown;
  // Error info
  error?: string;
}

export interface RefundPaymentResult {
  success: boolean;
  refundId?: string;
  amount?: number;
  error?: string;
}

// ============================================
// Payment Provider Interface
// ============================================

export interface PaymentProvider {
  /** Provider identifier */
  id: PaymentMethodId;

  /** Check if provider is properly configured */
  isConfigured(): boolean;

  /** Create a payment/order with the provider */
  createPayment(data: PaymentOrderData): Promise<CreatePaymentResult>;

  /** Capture/confirm a payment (for two-step payments like PayPal) */
  capturePayment(externalPaymentId: string): Promise<CapturePaymentResult>;

  /** Process refund */
  refundPayment(transactionId: string, amount?: number): Promise<RefundPaymentResult>;

  /** Verify webhook signature (for async notifications) */
  verifyWebhook?(payload: string, signature: string): boolean;
}

// ============================================
// Payment Registry
// ============================================

export interface PaymentRegistry {
  /** Get all available payment methods (configured and enabled) */
  getAvailableMethods(): PaymentMethodConfig[];

  /** Get a specific provider by ID */
  getProvider(id: PaymentMethodId): PaymentProvider | null;

  /** Register a new provider */
  registerProvider(provider: PaymentProvider, config: PaymentMethodConfig): void;
}

// ============================================
// Bank Transfer Specific
// ============================================

export interface BankTransferDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  reference: string;  // Order number as reference
  instructions: string;
}

// ============================================
// COD (Cash on Delivery) Specific
// ============================================

export interface CODConfig {
  maxOrderAmount?: number;
  additionalFee?: number;
  availableCountries?: string[];
}
