/**
 * Login Screen Example
 * Complete implementation with form validation and error handling
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth } from '../services/AuthContext';
import { useBiometricAuth } from '../hooks';
import { useFormValidation } from '../hooks';
import { AuthService } from '../services/AuthService';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginScreen({ navigation }: any) {
  const { login, isLoading, error: authError } = useAuth();
  const { capabilities, authenticate: biometricAuth, isLoading: bioLoading } =
    useBiometricAuth();

  // Form validation
  const { values, errors, touched, handleChange, handleBlur, resetForm } =
    useFormValidation<LoginFormData>(
      { email: '', password: '' },
      (values) => {
        const errors: Record<string, string> = {};

        if (!values.email) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
          errors.email = 'Invalid email format';
        }

        if (!values.password) {
          errors.password = 'Password is required';
        } else if (values.password.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        }

        return errors;
      }
    );

  // Handle login
  const handleLogin = async () => {
    if (Object.keys(errors).length > 0) {
      Alert.alert('Validation Error', 'Please check the form');
      return;
    }

    try {
      await login(values.email, values.password);
      // Navigation is handled by auth context
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Please try again');
    }
  };

  // Handle biometric login
  const handleBiometricLogin = async () => {
    try {
      await biometricAuth(values.email, values.password, {
        reason: 'Authenticate to access your account',
      });
    } catch (err: any) {
      // Biometric failed, show error or fallback to password
      if (err.userCancelled) {
        // User cancelled, no action needed
      } else {
        Alert.alert('Biometric Authentication', 'Please use your password instead');
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>
      </View>

      {/* Error Message */}
      {authError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{authError}</Text>
        </View>
      )}

      {/* Email Input */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={[
            styles.input,
            touched.email && errors.email && styles.inputError,
          ]}
          placeholder="your@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={values.email}
          onChangeText={(text) => handleChange('email', text)}
          onBlur={() => handleBlur('email')}
          editable={!isLoading}
        />
        {touched.email && errors.email && (
          <Text style={styles.errorText}>{errors.email}</Text>
        )}
      </View>

      {/* Password Input */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={[
            styles.input,
            touched.password && errors.password && styles.inputError,
          ]}
          placeholder="Enter your password"
          secureTextEntry
          value={values.password}
          onChangeText={(text) => handleChange('password', text)}
          onBlur={() => handleBlur('password')}
          editable={!isLoading}
        />
        {touched.password && errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
      </View>

      {/* Forgot Password Link */}
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.linkText}>Forgot password?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      {/* Biometric Button */}
      {capabilities?.canAuthenticate && (
        <TouchableOpacity
          style={[styles.bioButton, bioLoading && styles.buttonDisabled]}
          onPress={handleBiometricLogin}
          disabled={bioLoading}
        >
          {bioLoading ? (
            <ActivityIndicator color="#007AFF" />
          ) : (
            <Text style={styles.bioButtonText}>
              Login with {capabilities.supportedTypes[0]?.toUpperCase() || 'Biometric'}
            </Text>
          )}
        </TouchableOpacity>
      )}

      {/* Register Link */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
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
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#f00',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bioButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  bioButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
    textAlign: 'right',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  registerText: {
    fontSize: 14,
    color: '#666',
  },
  registerLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});
