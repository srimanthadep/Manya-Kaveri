export type UserRole = 'admin' | 'manager' | 'receptionist' | 'guest';

export interface User {
  id: number | string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface Property {
  id: number;
  name: string;
  city: string;
  star_rating: number;
  total_rooms?: number;
  available_rooms?: number;
  image_url?: string;
  description?: string;
}

export interface RoomType {
  id: number;
  name: string;
  description?: string;
  base_price: number;
  max_occupancy: number;
}

export interface Room {
  id: number;
  property_id: number;
  room_type_id: number;
  room_number: string;
  is_available?: boolean;
  status?: 'available' | 'occupied' | 'maintenance';
  property?: Property;
  room_type?: RoomType;
}

export interface Guest {
  id: number;
  name: string;
  email: string;
  phone: string;
  total_bookings?: number;
  created_at?: string;
}

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

export interface Booking {
  id: number;
  guest_id: number;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  status: BookingStatus;
  total_amount?: number;
  guest?: Guest;
  room?: Room;
  created_at?: string;
}

export type PaymentMethod = 'credit_card' | 'debit_card' | 'cash' | 'bank_transfer';

export interface Payment {
  id: number;
  booking_id: number;
  amount: number;
  payment_method: PaymentMethod;
  created_at: string;
  booking?: Booking;
}

export interface Review {
  id: number;
  booking_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  booking?: Booking;
}

export interface PropertyRating {
  property_id: number;
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    stars_5: number;
    stars_4: number;
    stars_3: number;
    stars_2: number;
    stars_1: number;
  };
}

export interface RatePlan {
  id: number;
  property_id: number;
  room_type_id: number;
  start_date: string;
  end_date: string;
  nightly_rate: number;
  property?: Property;
  room_type?: RoomType;
}

export interface DashboardSummary {
  total_revenue: number;
  total_bookings: number;
  avg_occupancy: number;
  avg_adr: number;
  properties_count: number;
  today_checkins: number;
  today_checkouts: number;
}

export interface RevenueByProperty {
  property_id: number;
  property_name: string;
  revenue: number;
  bookings_count: number;
  nights_sold: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  bookings: number;
}

export interface OccupancyByProperty {
  property_id: number;
  property_name: string;
  occupancy_rate: number;
  occupied_rooms: number;
  total_rooms: number;
}

export interface ADRByProperty {
  property_id: number;
  property_name: string;
  adr: number;
  revpar: number;
}

export interface BookingStatusSummary {
  confirmed: number;
  pending: number;
  cancelled: number;
  completed: number;
}

export interface FutureBooking30Days {
  date: string;
  booking_count: number;
  total_nights: number;
}

export interface ReportSummary {
  total_revenue: number;
  average_occupancy: number;
  monthly_revenue: { month: string; revenue: number; bookings: number }[];
  status_distribution: { name: string; value: number }[];
}
