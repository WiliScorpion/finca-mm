import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Dimensions, Platform } from 'react-native';
import { StudioFlat, Booking } from '../types';
import DateTimePicker from '../components/DateTimePicker';
import Header from '../components/Header';
import RoomGallery from '../components/RoomGallery';

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
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [guests, setGuests] = useState('1');

  const handleCheckInChange = (date: string, time: string) => {
    setCheckIn(date);
    setCheckInTime(time);
  };

  const handleCheckOutChange = (date: string, time: string) => {
    setCheckOut(date);
    setCheckOutTime(time);
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

  const handleSubmit = async () => {
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

    const bookingData = {
      studioId: studio.id,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      guests: numGuests,
      totalPrice: calculateTotal(),
    };

    try {
      const response = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      const booking: Booking = await response.json();

      if (!response.ok) {
        Alert.alert('Error', booking.toString());
        return;
      }

      onBookingComplete(booking);
    } catch (error) {
      // Fallback to local booking if API unavailable
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
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Header onHome={onBack} title={`Book ${studio.name}`} />

      <View style={styles.studioInfo}>
        <RoomGallery images={studio.images || []} roomName={studio.name} />
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

        <Text style={styles.label}>Check-in Date & Time *</Text>
        <DateTimePicker
          value={checkIn}
          onChange={handleCheckInChange}
          label="Select Check-in"
          minDate={new Date()}
        />

        <Text style={styles.label}>Check-out Date & Time *</Text>
        <DateTimePicker
          value={checkOut}
          onChange={handleCheckOutChange}
          label="Select Check-out"
          minDate={checkIn ? new Date(checkIn) : new Date()}
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
    backgroundColor: '#f4e4c1',
  },
  studioInfo: {
    backgroundColor: '#e8d4a8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#8b4513',
    marginHorizontal: 20,
    marginTop: 15,
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
    marginHorizontal: 20,
    marginBottom: 30,
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