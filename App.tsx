import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import StudiosListScreen from './src/screens/StudiosListScreen';
import BookingScreen from './src/screens/BookingScreen';
import BookingConfirmationScreen from './src/screens/BookingConfirmationScreen';
import { StudioFlat, Booking } from './src/types';

type Screen = 'list' | 'booking' | 'confirmation';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('list');
  const [selectedStudio, setSelectedStudio] = useState<StudioFlat | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const handleSelectStudio = (studio: StudioFlat) => {
    setSelectedStudio(studio);
    setCurrentScreen('booking');
  };

  const handleBookingComplete = (booking: Booking) => {
    setConfirmedBooking(booking);
    setCurrentScreen('confirmation');
  };

  const handleBackToHome = () => {
    setCurrentScreen('list');
    setSelectedStudio(null);
    setConfirmedBooking(null);
  };

  return (
    <>
      {currentScreen === 'list' && (
        <StudiosListScreen onSelectStudio={handleSelectStudio} />
      )}
      
      {currentScreen === 'booking' && selectedStudio && (
        <BookingScreen
          studio={selectedStudio}
          onBack={() => setCurrentScreen('list')}
          onBookingComplete={handleBookingComplete}
        />
      )}
      
      {currentScreen === 'confirmation' && confirmedBooking && (
        <BookingConfirmationScreen
          booking={confirmedBooking}
          onBackToHome={handleBackToHome}
        />
      )}
      
      <StatusBar style="auto" />
    </>
  );
}
