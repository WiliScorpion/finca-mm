/**
 * Payment Context
 * Manages payment state and operations across the app
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  PaymentIntent,
  PaymentContextType,
  PaymentMethod,
  Transaction,
  Receipt,
  PaymentError,
  CreatePaymentIntentRequest,
  ConfirmPaymentRequest,
} from '../types/payment';
import { StripePaymentService } from './StripePaymentService';

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

interface PaymentProviderProps {
  children: ReactNode;
}

/**
 * Payment Provider Component
 */
export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<PaymentError | null>(null);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  /**
   * Create payment intent
   */
  const handleCreatePaymentIntent = useCallback(
    async (amount: number, currency: string, metadata?: Record<string, string>) => {
      try {
        setError(null);
        setIsLoading(true);

        const request: CreatePaymentIntentRequest = {
          amount,
          currency,
          metadata,
        };

        const intent = await StripePaymentService.createPaymentIntent(request);
        setPaymentIntent(intent);
        return intent;
      } catch (err: any) {
        const paymentError = err as PaymentError;
        setError(paymentError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Confirm payment
   */
  const handleConfirmPayment = useCallback(async (clientSecret: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const request: ConfirmPaymentRequest = {
        paymentIntentId: clientSecret,
      };

      await StripePaymentService.confirmPayment(request);
      
      // Refresh transaction history
      await handleFetchTransactionHistory(20, 0);
    } catch (err: any) {
      const paymentError = err as PaymentError;
      setError(paymentError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Save payment method
   */
  const handleSavePaymentMethod = useCallback(async (paymentMethod: PaymentMethod) => {
    try {
      setError(null);
      setIsLoading(true);

      const saved = await StripePaymentService.savePaymentMethod(paymentMethod);
      setSavedPaymentMethods((prev) => [...prev, saved]);
    } catch (err: any) {
      const paymentError = err as PaymentError;
      setError(paymentError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Remove payment method
   */
  const handleRemovePaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      setError(null);
      setIsLoading(true);

      await StripePaymentService.removePaymentMethod(paymentMethodId);
      setSavedPaymentMethods((prev) =>
        prev.filter((pm) => pm.id !== paymentMethodId)
      );
    } catch (err: any) {
      const paymentError = err as PaymentError;
      setError(paymentError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch transaction history
   */
  const handleFetchTransactionHistory = useCallback(
    async (limit: number = 20, offset: number = 0) => {
      try {
        setError(null);
        setIsLoading(true);

        const transactionList = await StripePaymentService.fetchTransactionHistory(
          limit,
          offset
        );
        setTransactions(transactionList);
        return transactionList;
      } catch (err: any) {
        const paymentError = err as PaymentError;
        setError(paymentError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Fetch receipt
   */
  const handleFetchReceipt = useCallback(async (transactionId: string) => {
    try {
      setError(null);
      setIsLoading(true);

      return await StripePaymentService.fetchReceipt(transactionId);
    } catch (err: any) {
      const paymentError = err as PaymentError;
      setError(paymentError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refund transaction
   */
  const handleRefundTransaction = useCallback(async (transactionId: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const refunded = await StripePaymentService.refundTransaction(transactionId);
      
      // Update transaction in list
      setTransactions((prev) =>
        prev.map((t) => (t.id === transactionId ? refunded : t))
      );
    } catch (err: any) {
      const paymentError = err as PaymentError;
      setError(paymentError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: PaymentContextType = {
    paymentIntent,
    isLoading,
    error,
    savedPaymentMethods,
    transactions,
    createPaymentIntent: handleCreatePaymentIntent,
    confirmPayment: handleConfirmPayment,
    savePaymentMethod: handleSavePaymentMethod,
    removePaymentMethod: handleRemovePaymentMethod,
    fetchTransactionHistory: handleFetchTransactionHistory,
    fetchReceipt: handleFetchReceipt,
    refundTransaction: handleRefundTransaction,
  };

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
};

/**
 * Hook to use payment context
 */
export const usePayment = (): PaymentContextType => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};
