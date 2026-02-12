import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Dimensions, Platform } from 'react-native';
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
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleCheckInChange = (dateString: string) => {
    setCheckIn(dateString);
  };

  const handleCheckOutChange = (dateString: string) => {
    setCheckOut(dateString);
  };

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

        <Text style={styles.label}>Check-in Date *</Text>
        <TouchableOpacity 
          style={styles.dateInput}
          onPress={() => setShowCheckInPicker(!showCheckInPicker)}
        >
          <Text style={checkIn ? styles.dateText : styles.datePlaceholder}>
            {checkIn || 'Select check-in date'}
          </Text>
          <Text style={styles.calendarIcon}>📅</Text>
        </TouchableOpacity>
        {showCheckInPicker && (
          <input
            type="date"
            value={checkIn}
            onChange={(e) => {
              handleCheckInChange(e.target.value);
              setShowCheckInPicker(false);
            }}
            style={{
              width: '100%',
              padding: 12,
              fontSize: 16,
              borderRadius: 8,
              border: '1px solid #ddd',
              marginBottom: 15,
            }}
          />
        )}

        <Text style={styles.label}>Check-out Date *</Text>
        <TouchableOpacity 
          style={styles.dateInput}
          onPress={() => setShowCheckOutPicker(!showCheckOutPicker)}
        >
          <Text style={checkOut ? styles.dateText : styles.datePlaceholder}>
            {checkOut || 'Select check-out date'}
          </Text>
          <Text style={styles.calendarIcon}>📅</Text>
        </TouchableOpacity>
        {showCheckOutPicker && (
          <input
            type="date"
            value={checkOut}
            onChange={(e) => {
              handleCheckOutChange(e.target.value);
              setShowCheckOutPicker(false);
            }}
            style={{
              width: '100%',
              padding: 12,
              fontSize: 16,
              borderRadius: 8,
              border: '1px solid #ddd',
              marginBottom: 15,
            }}
          />
        )}

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
    backgroundColor: '#f4e4c1',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#8b4513',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#8b4513',
    textAlign: 'center',
  },
  studioInfo: {
    backgroundColor: '#e8d4a8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#8b4513',
  },
  studioPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#cd853f',
    marginBottom: 5,
  },
  studioCapacity: {
    fontSize: 14,
    color: '#8b4513',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#8b4513',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#8b4513',
  },
  input: {
    borderWidth: 2,
    borderColor: '#cd853f',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fef9f0',
  },
  dateInput: {
    borderWidth: 2,
    borderColor: '#cd853f',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fef9f0',
  },
  dateText: {
    fontSize: 16,
    color: '#8b4513',
  },
  datePlaceholder: {
    fontSize: 16,
    color: '#a0522d',
  },
  calendarIcon: {
    fontSize: 20,
  },
  summary: {
    backgroundColor: '#e8d4a8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#cd853f',
  },
  summaryText: {
    fontSize: 16,
    color: '#8b4513',
    marginBottom: 5,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#cd853f',
  },
  submitButton: {
    backgroundColor: '#cd853f',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8b4513',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
