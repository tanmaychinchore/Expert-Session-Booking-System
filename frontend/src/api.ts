import axios from 'axios';
import type { ExpertListResponse, ExpertResponse, BookingResponse } from './types';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchExperts = (page = 1, search = '', category = '') =>
  api.get<ExpertListResponse>('/experts', {
    params: {
      page,
      limit: 8,
      search: search.trim(),
      category: category !== 'All' ? category.trim() : undefined,
    },
  });

export const fetchExpertById = (id: string) => api.get<ExpertResponse>(`/experts/${id}`);

export const createBooking = (payload: {
  expert: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  timeSlot: string;
  notes: string;
}) => api.post<BookingResponse>('/bookings', payload);

export const fetchBookingsByEmail = (email: string) =>
  api.get<{ success: boolean; data: BookingResponse['data'][] }>('/bookings', {
    params: { email: email.trim() },
  });
