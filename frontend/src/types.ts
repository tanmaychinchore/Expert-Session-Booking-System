export interface SlotItem {
  time: string;
  isBooked: boolean;
}

export interface SlotGroup {
  date: string;
  slots: SlotItem[];
}

export interface Expert {
  _id: string;
  name: string;
  category: string;
  experience: number;
  rating: number;
  bio: string;
  price: number;
  slotGroups?: SlotGroup[];
}

export interface Booking {
  _id: string;
  expert: Expert;
  name: string;
  email: string;
  phone: string;
  date: string;
  timeSlot: string;
  notes: string;
  status: 'Pending' | 'Confirmed' | 'Completed';
  createdAt: string;
}

export interface ExpertListResponse {
  success: boolean;
  data: Expert[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ExpertResponse {
  success: boolean;
  data: Expert;
}

export interface BookingResponse {
  success: boolean;
  data: Booking;
}
