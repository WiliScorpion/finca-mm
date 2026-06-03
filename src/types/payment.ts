/**
 * Payment & Stripe Types
 * Comprehensive TypeScript interfaces for payment processing
 */

/**
 * Card Information
 */
export interface CardDetails {
  number: string;
  expMonth: number;
  expYear: number;
  cvc: string;
  name: string;
  postalCode?: string;
}

/**
 * Stripe Payment Intent
 */
export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number; // in cents
  currency: string;
  status: PaymentIntentStatus;
  paymentMethod?: string;
  lastPaymentError?: PaymentError;
  receiptEmail?: string;
  metadata?: Record<string, string>;
  createdAt: string;
}

export enum PaymentIntentStatus {
  REQUIRES_PAYMENT_METHOD = 'requires_payment_method',
  REQUIRES_CONFIRMATION = 'requires_confirmation',
  REQUIRES_ACTION = 'requires_action',
  PROCESSING = 'processing',
  REQUIRES_CAPTURE = 'requires_capture',
  SUCCEEDED = 'succeeded',
  CANCELED = 'canceled',
}

/**
 * Payment Method
 */
export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  card?: {
    brand: string; // visa, mastercard, amex, discover
    last4: string;
    expMonth: number;
    expYear: number;
  };
  billingDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postalCode?: string;
      state?: string;
    };
  };
}

/**
 * Transaction Record
 */
export interface Transaction {
  id: string;
  userId: string;
  amount: number; // in cents
  currency: string;
  status: TransactionStatus;
  paymentMethodId: string;
  paymentIntentId: string;
  description?: string;
  metadata?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  successAt?: string;
  receipt?: Receipt;
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
}

/**
 * Receipt
 */
export interface Receipt {
  id: string;
  transactionId: string;
  receiptNumber: string;
  amountCharged: number; // in cents
  currency: string;
  paymentMethod: PaymentMethodDisplay;
  issuedAt: string;
  itemizedCharges?: LineItem[];
  tax?: number;
  discount?: number;
  total: number;
}

export interface LineItem {
  description: string;
  quantity: number;
  unitAmount: number; // in cents
  totalAmount: number; // in cents
}

export interface PaymentMethodDisplay {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

/**
 * Payment Error from Stripe
 */
export interface PaymentError {
  code: string;
  message: string;
  type: string;
  chargeId?: string;
  docUrl?: string;
  param?: string;
  paymentIntentId?: string;
  paymentMethodId?: string;
  statementDescriptor?: string;
}

/**
 * Payment Context Type
 */
export interface PaymentContextType {
  paymentIntent: PaymentIntent | null;
  isLoading: boolean;
  error: PaymentError | null;
  savedPaymentMethods: PaymentMethod[];
  transactions: Transaction[];
  createPaymentIntent: (amount: number, currency: string, metadata?: Record<string, string>) => Promise<PaymentIntent>;
  confirmPayment: (clientSecret: string, returnUrl?: string) => Promise<void>;
  savePaymentMethod: (paymentMethod: PaymentMethod) => Promise<void>;
  removePaymentMethod: (paymentMethodId: string) => Promise<void>;
  fetchTransactionHistory: (limit?: number, offset?: number) => Promise<Transaction[]>;
  fetchReceipt: (transactionId: string) => Promise<Receipt>;
  refundTransaction: (transactionId: string) => Promise<void>;
}

/**
 * Payment Request Payload for Backend
 */
export interface CreatePaymentIntentRequest {
  amount: number; // in cents
  currency: string;
  paymentMethodId?: string;
  description?: string;
  metadata?: Record<string, string>;
  receiptEmail?: string;
  statementDescriptor?: string;
}

/**
 * Payment Confirmation Payload
 */
export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  paymentMethodId?: string;
  savePaymentMethod?: boolean;
  useStripeSDK?: boolean;
}

/**
 * Transaction Response from Backend
 */
export interface TransactionResponse {
  id: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethodId: string;
  createdAt: string;
  receipt: Receipt;
}
