import React from 'react';
import { StudioFlat } from '../types';
import AmphitheaterBookingScreen from './AmphitheaterBookingScreen';

interface Props {
  studios: StudioFlat[];
  onSelectStudio: (studio: StudioFlat) => void;
}

export default function StudiosListScreen({ studios, onSelectStudio }: Props) {
  return (
    <AmphitheaterBookingScreen
      studios={studios}
      onStudioSelect={onSelectStudio}
      onBack={() => {}}
    />
  );
}
