import React from 'react';
import { STUDIOS } from '../data/studios';
import { StudioFlat } from '../types';
import AmphitheaterBookingScreen from './AmphitheaterBookingScreen';

interface Props {
  onSelectStudio: (studio: StudioFlat) => void;
}

export default function StudiosListScreen({ onSelectStudio }: Props) {
  return (
    <AmphitheaterBookingScreen
      studios={STUDIOS}
      onStudioSelect={onSelectStudio}
      onBack={() => {}}
    />
  );
}
