/**
 * Bank Transfer Payment Provider
 * Manual payment method - shows bank details for customer to transfer
 *
 * To enable:
 * 1. Add bank details to .env
 * 2. Set ENABLE_BANK_TRANSFER=true
 */

import type {
  PaymentProvider,
  PaymentOrderData,
  CreatePaymentResult,
  CapturePaymentResult,
  RefundPaymentResult,
  BankTransferDetails,
} from '../types';

// Environment config
const getConfig = () => ({
  enabled: import.meta.env.ENABLE_BANK_TRANSFER === 'true',
  bankName: import.meta.env.BANK_NAME || '',
  accountName: import.meta.env.BANK_ACCOUNT_NAME || '',
  accountNumber: import.meta.env.BANK_ACCOUNT_NUMBER || '',
  routingNumber: import.meta.env.BANK_ROUTING_NUMBER || '',
  swiftCode: import.meta.env.BANK_SWIFT_CODE || '',
  iban: import.meta.env.BANK_IBAN || '',
  instructions: import.meta.env.BANK_TRANSFER_INSTRUCTIONS || 'Please include your order number as payment reference.',
});

class BankTransferProvider implements PaymentProvider {
  id = 'bank_transfer' as const;

  isConfigured(): boolean {
    const config = getConfig();
    return config.enabled && !!(config.bankName && config.accountNumber);
  }

  getBankDetails(orderNumber: string): BankTransferDetails {
    const config = getConfig();
    return {
      bankName: config.bankName,
      accountName: config.accountName,
      accountNumber: config.accountNumber,
      routingNumber: config.routingNumber || undefined,
      swiftCode: config.swiftCode || undefined,
      iban: config.iban || undefined,
      reference: orderNumber,
      instructions: config.instructions,
    };
  }

  async createPayment(data: PaymentOrderData): Promise<CreatePaymentResult> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Bank transfer is not configured' };
    }

    // For bank transfer, we don't create an external payment
    // Instead, we return the bank details for the customer
    const bankDetails = this.getBankDetails(data.orderNumber);

    return {
      success: true,
      // No external payment ID for manual transfer
      externalPaymentId: `BANK-${data.orderNumber}`,
      metadata: {
        type: 'bank_transfer',
        bankDetails,
        amount: data.total,
        currency: data.currency,
        instructions: `Please transfer ${data.currency} ${data.total.toFixed(2)} to the bank account below. Use order number ${data.orderNumber} as reference.`,
      },
    };
  }

  async capturePayment(_externalPaymentId: string): Promise<CapturePaymentResult> {
    // Bank transfer is manually confirmed by admin
    // This method should be called when admin confirms payment received
    return {
      success: true,
      transactionId: _externalPaymentId,
      rawResponse: { note: 'Manually confirmed by admin' },
    };
  }

  async refundPayment(_transactionId: string, _amount?: number): Promise<RefundPaymentResult> {
    // Bank transfer refunds are manual
    return {
      success: true,
      refundId: `REFUND-${_transactionId}`,
    };
  }
}

// Export singleton instance
export const bankTransferProvider = new BankTransferProvider();
