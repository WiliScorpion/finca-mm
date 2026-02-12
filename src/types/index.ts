export interface StudioFlat {
  id: number;
  name: string;
  description: string;
  price: number;
  capacity: number;
  amenities: string[];
  imageUrl?: string;
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
