/**
 * Stripe Payment Service
 * Handles payment processing with Stripe SDK
 */

import { ApiClient } from './ApiClient';
import {
  PaymentIntent,
  Transaction,
  Receipt,
  PaymentMethod,
  CreatePaymentIntentRequest,
  ConfirmPaymentRequest,
  TransactionStatus,
  PaymentError,
} from '../types/payment';

export class StripePaymentService {
  /**
   * Create a payment intent on the backend
   * Backend will handle creation with Stripe and return clientSecret
   */
  static async createPaymentIntent(
    request: CreatePaymentIntentRequest
  ): Promise<PaymentIntent> {
    try {
      const response = await ApiClient.post<PaymentIntent>(
        '/payments/create-intent',
        request
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Failed to create payment intent');
    } catch (error: any) {
      throw this.handlePaymentError(error);
    }
  }

  /**
   * Confirm payment with Stripe
   * In production with Stripe SDK:
   * 1. Use confirmPaymentSheetPayment() for web/mobile
   * 2. Handle 3D Secure challenges if needed
   */
  static async confirmPayment(request: ConfirmPaymentRequest): Promise<void> {
    try {
      const response = await ApiClient.post(
        '/payments/confirm',
        request
      );

      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Payment confirmation failed');
      }
    } catch (error: any) {
      throw this.handlePaymentError(error);
    }
  }

  /**
   * Fetch transaction history
   */
  static async fetchTransactionHistory(
    limit: number = 20,
    offset: number = 0
  ): Promise<Transaction[]> {
    try {
      const response = await ApiClient.get<Transaction[]>(
        `/payments/transactions?limit=${limit}&offset=${offset}`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return [];
    } catch (error: any) {
      console.error('Failed to fetch transaction history:', error);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  static async getTransaction(transactionId: string): Promise<Transaction> {
    try {
      const response = await ApiClient.get<Transaction>(
        `/payments/transactions/${transactionId}`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Transaction not found');
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Fetch receipt for a transaction
   */
  static async fetchReceipt(transactionId: string): Promise<Receipt> {
    try {
      const response = await ApiClient.get<Receipt>(
        `/payments/receipts/${transactionId}`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Receipt not found');
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Download receipt as PDF
   */
  static async downloadReceipt(transactionId: string): Promise<Blob> {
    try {
      const response = await ApiClient.getInstance().get(
        `/payments/receipts/${transactionId}/download`,
        {
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Save payment method
   * OWASP: Card details should NEVER be handled by frontend
   * Only tokenized payment methods from Stripe should be saved
   */
  static async savePaymentMethod(
    paymentMethod: PaymentMethod
  ): Promise<PaymentMethod> {
    try {
      const response = await ApiClient.post<PaymentMethod>(
        '/payments/payment-methods',
        paymentMethod
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Failed to save payment method');
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get saved payment methods
   */
  static async getSavedPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await ApiClient.get<PaymentMethod[]>(
        '/payments/payment-methods'
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return [];
    } catch (error: any) {
      console.error('Failed to fetch payment methods:', error);
      return [];
    }
  }

  /**
   * Remove payment method
   */
  static async removePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      const response = await ApiClient.delete(
        `/payments/payment-methods/${paymentMethodId}`
      );

      if (!response.data.success) {
        throw new Error('Failed to remove payment method');
      }
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Set default payment method
   */
  static async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      const response = await ApiClient.put(
        `/payments/payment-methods/${paymentMethodId}/default`,
        {}
      );

      if (!response.data.success) {
        throw new Error('Failed to set default payment method');
      }
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Refund transaction
   * OWASP: Only authorized backend should handle refunds
   */
  static async refundTransaction(
    transactionId: string,
    reason?: string
  ): Promise<Transaction> {
    try {
      const response = await ApiClient.post<Transaction>(
        `/payments/transactions/${transactionId}/refund`,
        { reason }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Refund failed');
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get payment statistics
   */
  static async getPaymentStats(): Promise<any> {
    try {
      const response = await ApiClient.get('/payments/stats');

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Failed to fetch payment stats:', error);
      return null;
    }
  }

  /**
   * Handle payment-specific errors
   */
  private static handlePaymentError(error: any): PaymentError {
    if (error.statusCode) {
      switch (error.statusCode) {
        case 400:
          return {
            code: 'invalid_payment_details',
            message: 'Invalid payment details. Please check and try again.',
            type: 'validation_error',
          };
        case 402:
          return {
            code: 'card_declined',
            message: 'Your card was declined. Please try another card.',
            type: 'card_error',
          };
        case 403:
          return {
            code: 'insufficient_funds',
            message: 'Insufficient funds. Please try another card.',
            type: 'card_error',
          };
        case 429:
          return {
            code: 'rate_limited',
            message: 'Too many attempts. Please try again later.',
            type: 'rate_limit_error',
          };
      }
    }

    return {
      code: 'unknown_error',
      message: error.message || 'Payment processing failed',
      type: 'unknown',
    };
  }

  /**
   * Calculate fees
   */
  static calculateStripeFee(amountCents: number): number {
    // Standard Stripe fee: 2.9% + 30¢
    const percentage = amountCents * 0.029;
    const fixed = 30;
    return Math.round(percentage + fixed);
  }

  /**
   * Format amount for display (e.g., cents to dollars)
   */
  static formatAmount(amountCents: number, currency: string = 'USD'): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    });
    return formatter.format(amountCents / 100);
  }

  /**
   * Generate receipt number
   */
  static generateReceiptNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `REC-${timestamp}-${random}`;
  }

  /**
   * OWASP: Validate payment amount
   */
  static validatePaymentAmount(amount: number): boolean {
    // Minimum: $0.50
    // Maximum: $999,999.99
    return amount >= 50 && amount <= 99999999;
  }

  /**
   * Get transaction status display
   */
  static getStatusDisplay(status: TransactionStatus): string {
    const statusMap: Record<TransactionStatus, string> = {
      [TransactionStatus.PENDING]: 'Pending',
      [TransactionStatus.PROCESSING]: 'Processing',
      [TransactionStatus.SUCCEEDED]: 'Succeeded',
      [TransactionStatus.FAILED]: 'Failed',
      [TransactionStatus.CANCELED]: 'Canceled',
      [TransactionStatus.REFUNDED]: 'Refunded',
    };
    return statusMap[status] || 'Unknown';
  }
}
