import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import StudiosListScreen from './screens/StudiosListScreen';
import BookingScreen from './screens/BookingScreen';
import BookingConfirmationScreen from './screens/BookingConfirmationScreen';
import { StudioFlat, Booking } from './types';
import { STUDIOS } from './data/studios';

const API_URL = 'http://localhost:3000';

type Screen = 'list' | 'booking' | 'confirmation';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('list');
  const [selectedStudio, setSelectedStudio] = useState<StudioFlat | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [studios, setStudios] = useState<StudioFlat[]>(STUDIOS);

  // Fetch latest studio availability from API
  const refreshStudios = async () => {
    try {
      const res = await fetch(`${API_URL}/api/studios`);
      const apiStudios = await res.json();
      // Merge API availability with local studio data (to keep icons/images)
      setStudios(prev => prev.map(local => {
        const apiStudio = apiStudios.find((s: any) => s.id === local.id);
        return apiStudio ? { ...local, available: apiStudio.available } : local;
      }));
    } catch {
      // Keep local data if API unavailable
    }
  };

  // Refresh on mount and every 10 seconds
  useEffect(() => {
    refreshStudios();
    const interval = setInterval(refreshStudios, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectStudio = (studio: StudioFlat) => {
    setSelectedStudio(studio);
    setCurrentScreen('booking');
  };

  const handleBookingComplete = (booking: Booking) => {
    setConfirmedBooking(booking);
    setCurrentScreen('confirmation');
    refreshStudios(); // Refresh immediately after booking
  };

  const handleBackToHome = () => {
    setCurrentScreen('list');
    setSelectedStudio(null);
    setConfirmedBooking(null);
    refreshStudios(); // Refresh when going back to home
  };

  return (
    <>
      {currentScreen === 'list' && (
        <StudiosListScreen studios={studios} onSelectStudio={handleSelectStudio} />
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
