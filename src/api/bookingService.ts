import { apiClient } from './client';
import { Booking, StudioFlat } from '../types';

export const bookingService = {
  async getStudios(): Promise<StudioFlat[]> {
    return apiClient.get('/studios');
  },

  async getStudioById(id: number): Promise<StudioFlat> {
    return apiClient.get(`/studios/${id}`);
  },

  async createBooking(booking: Omit<Booking, 'id' | 'status'>): Promise<Booking> {
    return apiClient.post('/bookings', booking);
  },

  async getBookings(): Promise<Booking[]> {
    return apiClient.get('/bookings');
  },

  async getBookingById(id: string): Promise<Booking> {
    return apiClient.get(`/bookings/${id}`);
  },

  async cancelBooking(id: string): Promise<void> {
    return apiClient.delete(`/bookings/${id}`);
  },
};
