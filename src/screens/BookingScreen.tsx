import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { StudioFlat, Booking } from '../types';

interface Props {
  studio: StudioFlat;
  onBack: () => void;
  onBookingComplete: (booking: Booking) => void;
}

export default function BookingScreen({ studio, onBack, onBookingComplete }: Props) {
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const calculateTotal = () => {
    return calculateNights() * studio.price;
  };

  const handleSubmit = () => {
    if (!guestName || !guestEmail || !guestPhone || !checkIn || !checkOut) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const numGuests = parseInt(guests);
    if (numGuests > studio.capacity) {
      Alert.alert('Error', `This studio can accommodate up to ${studio.capacity} guests`);
      return;
    }

    if (calculateNights() <= 0) {
      Alert.alert('Error', 'Check-out date must be after check-in date');
      return;
    }

    const booking: Booking = {
      id: Date.now().toString(),
      studioId: studio.id,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      guests: numGuests,
      totalPrice: calculateTotal(),
      status: 'pending',
    };

    onBookingComplete(booking);
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Book {studio.name}</Text>
      
      <View style={styles.studioInfo}>
        <Text style={styles.studioPrice}>${studio.price}/night</Text>
        <Text style={styles.studioCapacity}>Up to {studio.capacity} guests</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Guest Name *</Text>
        <TextInput
          style={styles.input}
          value={guestName}
          onChangeText={setGuestName}
          placeholder="Enter your full name"
        />

        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={guestEmail}
          onChangeText={setGuestEmail}
          placeholder="your@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Phone *</Text>
        <TextInput
          style={styles.input}
          value={guestPhone}
          onChangeText={setGuestPhone}
          placeholder="+1234567890"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Check-in Date * (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={checkIn}
          onChangeText={setCheckIn}
          placeholder="2024-03-15"
        />

        <Text style={styles.label}>Check-out Date * (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={checkOut}
          onChangeText={setCheckOut}
          placeholder="2024-03-20"
        />

        <Text style={styles.label}>Number of Guests *</Text>
        <TextInput
          style={styles.input}
          value={guests}
          onChangeText={setGuests}
          placeholder="1"
          keyboardType="number-pad"
        />

        {calculateNights() > 0 && (
          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              {calculateNights()} night{calculateNights() > 1 ? 's' : ''} × ${studio.price}
            </Text>
            <Text style={styles.totalPrice}>Total: ${calculateTotal()}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Confirm Booking</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2196F3',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  studioInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  studioPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  studioCapacity: {
    fontSize: 14,
    color: '#666',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  summary: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
