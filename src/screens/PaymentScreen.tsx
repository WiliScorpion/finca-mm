/**
 * Payment Screen Example
 * Complete implementation showing Stripe payment integration
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView,
  FlatList,
  Image,
  TextInput,
} from 'react-native';
import { usePayment } from '../services/PaymentContext';
import { StripePaymentService } from '../services/StripePaymentService';
import { Transaction, TransactionStatus } from '../types/payment';

export default function PaymentHistoryScreen() {
  const { transactions, isLoading, error, fetchTransactionHistory } = usePayment();
  const [refreshing, setRefreshing] = useState(false);

  // Load transactions on mount
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      await fetchTransactionHistory(20, 0);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadTransactions();
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: TransactionStatus): string => {
    switch (status) {
      case TransactionStatus.SUCCEEDED:
        return '#10b981';
      case TransactionStatus.PENDING:
      case TransactionStatus.PROCESSING:
        return '#f59e0b';
      case TransactionStatus.FAILED:
      case TransactionStatus.CANCELED:
        return '#ef4444';
      case TransactionStatus.REFUNDED:
        return '#6366f1';
      default:
        return '#6b7280';
    }
  };

  const getStatusDisplay = (status: TransactionStatus): string => {
    return StripePaymentService.getStatusDisplay(status);
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={styles.transactionCard}
      onPress={() => {
        // Navigate to transaction details
        Alert.alert(
          'Transaction Details',
          `ID: ${item.id}\nStatus: ${getStatusDisplay(item.status)}\nAmount: ${StripePaymentService.formatAmount(item.amount, item.currency)}`
        );
      }}
    >
      <View style={styles.transactionContent}>
        <View>
          <Text style={styles.transactionId}>Transaction #{item.id.slice(0, 8)}</Text>
          <Text style={styles.transactionDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.transactionRight}>
          <Text style={styles.transactionAmount}>
            {StripePaymentService.formatAmount(item.amount, item.currency)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusDisplay(item.status)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && !transactions.length) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment History</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load transactions</Text>
        </View>
      )}

      {transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No transactions yet</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

/**
 * MFA Enrollment Screen Example
 */
export function MFAEnrollmentScreen() {
  const [step, setStep] = useState<'choose' | 'totp' | 'verify'>('choose');
  const [totpSecret, setTotpSecret] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { MFAService } = require('../services');

  const handleEnrollTOTP = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const enrollment = await MFAService.enrollTOTP();
      setTotpSecret(enrollment);
      setStep('totp');
    } catch (err: any) {
      setError(err.message || 'Failed to enroll TOTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      setError(null);
      setIsLoading(true);

      if (!verificationCode || verificationCode.length !== 6) {
        setError('Please enter a valid 6-digit code');
        return;
      }

      await MFAService.verifyMFAEnrollment('totp', verificationCode);
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.mfaContainer}>
      <Text style={styles.title}>Enable Two-Factor Authentication</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {step === 'choose' && (
        <View>
          <Text style={styles.subtitle}>Choose an authentication method:</Text>

          <TouchableOpacity style={styles.methodButton} onPress={handleEnrollTOTP}>
            <Text style={styles.methodTitle}>Authenticator App</Text>
            <Text style={styles.methodDescription}>
              Use Google Authenticator, Microsoft Authenticator, or Authy
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'totp' && totpSecret && (
        <View>
          <Text style={styles.subtitle}>Scan this QR code with your authenticator app:</Text>

          {/* QR Code would be rendered here */}
          <View style={styles.qrCodePlaceholder}>
            <Text style={styles.qrCodeText}>QR Code Placeholder</Text>
            <Text style={styles.qrCodeSubtext}>In production, use qrcode.react</Text>
          </View>

          <Text style={styles.manualCode}>Or enter this code manually:</Text>
          <View style={styles.secretContainer}>
            <Text style={styles.secretText}>{totpSecret.secret}</Text>
          </View>

          <Text style={styles.subtitle}>Enter the 6-digit code from your app:</Text>
          <View style={styles.codeInputContainer}>
            <TextInput
              style={styles.codeInput}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              value={verificationCode}
              onChangeText={setVerificationCode}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleVerifyCode}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {step === 'verify' && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>✓ Two-factor authentication enabled!</Text>
          <Text style={styles.successSubtext}>
            Your account is now more secure. You'll need to verify a code when logging in.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

/**
 * Transaction Details Screen Example
 */
export function TransactionDetailsScreen({ transactionId }: any) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [receipt, setReceipt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { StripePaymentService } = require('../services');

  useEffect(() => {
    loadTransactionDetails();
  }, [transactionId]);

  const loadTransactionDetails = async () => {
    try {
      setError(null);
      const tx = await StripePaymentService.getTransaction(transactionId);
      setTransaction(tx);

      const rcpt = await StripePaymentService.fetchReceipt(transactionId);
      setReceipt(rcpt);
    } catch (err: any) {
      setError(err.message || 'Failed to load transaction details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      const blob = await StripePaymentService.downloadReceipt(transactionId);
      // Download or share the PDF
      Alert.alert('Success', 'Receipt downloaded');
    } catch (err: any) {
      Alert.alert('Error', 'Failed to download receipt');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error || !transaction) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Transaction not found'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.detailsCard}>
        <Text style={styles.title}>Transaction Details</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount</Text>
          <Text style={styles.detailValue}>
            {StripePaymentService.formatAmount(transaction.amount, transaction.currency)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status</Text>
          <Text
            style={[
              styles.detailValue,
              { color: StripePaymentService.getStatusDisplay(transaction.status) === 'Succeeded' ? '#10b981' : '#ef4444' },
            ]}
          >
            {StripePaymentService.getStatusDisplay(transaction.status)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>
            {new Date(transaction.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Transaction ID</Text>
          <Text style={styles.detailValue}>{transaction.id}</Text>
        </View>

        {receipt && (
          <TouchableOpacity style={styles.button} onPress={handleDownloadReceipt}>
            <Text style={styles.buttonText}>Download Receipt</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 12,
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderLeftWidth: 4,
    borderLeftColor: '#f00',
    padding: 12,
    borderRadius: 4,
    marginBottom: 20,
  },
  errorText: {
    color: '#c33',
    fontSize: 14,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  listContent: {
    paddingBottom: 20,
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionId: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mfaContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  methodButton: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginVertical: 12,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: '#666',
  },
  qrCodePlaceholder: {
    backgroundColor: '#f0f0f0',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 20,
  },
  qrCodeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  qrCodeSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  manualCode: {
    fontSize: 14,
    marginVertical: 12,
  },
  secretContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  secretText: {
    fontSize: 14,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  codeInputContainer: {
    marginVertical: 16,
  },
  codeInput: {
    borderWidth: 2,
    borderColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginVertical: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});
