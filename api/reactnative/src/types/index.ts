/**
 * Studio and Booking Types
 */
export interface StudioFlat {
  id: number;
  name: string;
  description: string;
  price: number;
  capacity: number;
  amenities: string[];
  imageUrl?: string;
  images?: any[];
  icon?: any;
  available: boolean;
}

export interface Booking {
  id: string;
  studioId: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

/**
 * Export all auth, payment, and MFA types
 */
export * from './auth';
export * from './payment';
export * from './mfa';
export * from './api';
