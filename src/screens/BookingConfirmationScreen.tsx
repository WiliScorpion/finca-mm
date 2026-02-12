import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Booking } from '../types';

interface Props {
  booking: Booking;
  onBackToHome: () => void;
}

export default function BookingConfirmationScreen({ booking, onBackToHome }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.successIcon}>
        <Text style={styles.checkmark}>✓</Text>
      </View>
      
      <Text style={styles.title}>Booking Confirmed!</Text>
      <Text style={styles.subtitle}>Thank you for your reservation</Text>
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Booking Details</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Booking ID:</Text>
          <Text style={styles.value}>{booking.id}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Guest Name:</Text>
          <Text style={styles.value}>{booking.guestName}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{booking.guestEmail}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{booking.guestPhone}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.row}>
          <Text style={styles.label}>Check-in:</Text>
          <Text style={styles.value}>{booking.checkIn}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Check-out:</Text>
          <Text style={styles.value}>{booking.checkOut}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Guests:</Text>
          <Text style={styles.value}>{booking.guests}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalValue}>${booking.totalPrice}</Text>
        </View>
      </View>
      
      <Text style={styles.infoText}>
        A confirmation email has been sent to {booking.guestEmail}
      </Text>
      
      <TouchableOpacity style={styles.button} onPress={onBackToHome}>
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4e4c1',
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#cd853f',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#8b4513',
  },
  checkmark: {
    fontSize: 50,
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8b4513',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0522d',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 3,
    borderColor: '#8b4513',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8b4513',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#a0522d',
  },
  value: {
    fontSize: 14,
    color: '#8b4513',
    fontWeight: '500',
  },
  divider: {
    height: 2,
    backgroundColor: '#d4a574',
    marginVertical: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8b4513',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#cd853f',
  },
  infoText: {
    fontSize: 14,
    color: '#a0522d',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#cd853f',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8b4513',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
