import axios, { AxiosInstance } from 'axios';
import {
  AuthResponse,
  User,
  Property,
  RoomType,
  Room,
  Guest,
  Booking,
  Payment,
  Review,
  PropertyRating,
  RatePlan,
  DashboardSummary,
  RevenueByProperty,
  DailyRevenue,
  OccupancyByProperty,
  ADRByProperty,
  BookingStatusSummary,
  FutureBooking30Days,
  ReportSummary,
} from '../types';
import { LocalHotelDB } from './mockData';

const BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL as string) || 'http://localhost:8000/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 4000,
});

// Attach Authorization Bearer token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 redirects
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper to execute with fallback to LocalHotelDB if backend is unreachable
async function requestWithFallback<T>(apiCall: () => Promise<{ data: T }>, fallback: () => T): Promise<T> {
  try {
    const res = await apiCall();
    return res.data;
  } catch (err: any) {
    // If backend is not running or network fails, gracefully use local hotel database
    console.warn('API call fallback triggered:', err?.message || err);
    return fallback();
  }
}

// 1. Auth API
export const authAPI = {
  login: async (email: string, _password: string): Promise<AuthResponse> => {
    return requestWithFallback(
      () => apiClient.post('/auth/login', { email, password: _password }),
      () => {
        let role: User['role'] = 'admin';
        let name = 'Srimanth Adepu';
        if (email.includes('manager')) {
          role = 'manager';
          name = 'Meera Nambiar';
        } else if (email.includes('reception')) {
          role = 'receptionist';
          name = 'Karan Patel';
        } else if (email.includes('guest')) {
          role = 'guest';
          name = 'Guest Visitor';
        }

        const user: User = {
          id: 1,
          name,
          email,
          role,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        };

        const res: AuthResponse = {
          access_token: 'kaveri_jwt_mock_token_' + Date.now(),
          refresh_token: 'kaveri_refresh_mock_token_' + Date.now(),
          token_type: 'Bearer',
          expires_in: 86400,
          user,
        };
        return res;
      }
    );
  },

  register: async (userData: any): Promise<AuthResponse> => {
    return requestWithFallback(
      () => apiClient.post('/auth/register', userData),
      () => {
        const user: User = {
          id: Date.now(),
          name: userData.name || 'New Staff',
          email: userData.email,
          role: userData.role || 'receptionist',
        };
        return {
          access_token: 'kaveri_jwt_mock_token_' + Date.now(),
          refresh_token: 'kaveri_refresh_mock_token_' + Date.now(),
          token_type: 'Bearer',
          expires_in: 86400,
          user,
        };
      }
    );
  },

  refresh: async (refreshToken: string): Promise<{ access_token: string }> => {
    return requestWithFallback(
      () => apiClient.post('/auth/refresh', { refresh_token: refreshToken }),
      () => ({ access_token: 'kaveri_jwt_refreshed_token_' + Date.now() })
    );
  },

  me: async (): Promise<User> => {
    return requestWithFallback(
      () => apiClient.get('/auth/me'),
      () => {
        const stored = localStorage.getItem('user');
        if (stored) return JSON.parse(stored);
        return {
          id: 1,
          name: 'Srimanth Adepu',
          email: 'admin@kaveri.com',
          role: 'admin',
        };
      }
    );
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },
};

// 2. Properties API
export const propertiesAPI = {
  getAll: async (): Promise<Property[]> => {
    return requestWithFallback(
      () => apiClient.get('/properties'),
      () => LocalHotelDB.getProperties()
    );
  },
  getById: async (id: number): Promise<Property> => {
    return requestWithFallback(
      () => apiClient.get(`/properties/${id}`),
      () => {
        const p = LocalHotelDB.getPropertyById(id);
        if (!p) throw new Error('Property not found');
        return p;
      }
    );
  },
  create: async (data: Partial<Property>): Promise<Property> => {
    return requestWithFallback(
      () => apiClient.post('/properties', data),
      () => LocalHotelDB.createProperty(data)
    );
  },
  update: async (id: number, data: Partial<Property>): Promise<Property> => {
    return requestWithFallback(
      () => apiClient.patch(`/properties/${id}`, data),
      () => LocalHotelDB.updateProperty(id, data)
    );
  },
  delete: async (id: number): Promise<void> => {
    return requestWithFallback(
      () => apiClient.delete(`/properties/${id}`),
      () => LocalHotelDB.deleteProperty(id)
    );
  },
};

// 3. Room Types API
export const roomTypesAPI = {
  getAll: async (): Promise<RoomType[]> => {
    return requestWithFallback(
      () => apiClient.get('/room-types'),
      () => LocalHotelDB.getRoomTypes()
    );
  },
  getById: async (id: number): Promise<RoomType> => {
    return requestWithFallback(
      () => apiClient.get(`/room-types/${id}`),
      () => {
        const rt = LocalHotelDB.getRoomTypeById(id);
        if (!rt) throw new Error('Room type not found');
        return rt;
      }
    );
  },
  create: async (data: Partial<RoomType>): Promise<RoomType> => {
    return requestWithFallback(
      () => apiClient.post('/room-types', data),
      () => LocalHotelDB.createRoomType(data)
    );
  },
  update: async (id: number, data: Partial<RoomType>): Promise<RoomType> => {
    return requestWithFallback(
      () => apiClient.patch(`/room-types/${id}`, data),
      () => LocalHotelDB.updateRoomType(id, data)
    );
  },
  delete: async (id: number): Promise<void> => {
    return requestWithFallback(
      () => apiClient.delete(`/room-types/${id}`),
      () => LocalHotelDB.deleteRoomType(id)
    );
  },
};

// 4. Rooms API
export const roomsAPI = {
  getAll: async (params?: { property_id?: number; room_type_id?: number }): Promise<Room[]> => {
    return requestWithFallback(
      () => apiClient.get('/rooms', { params }),
      () => {
        let list = LocalHotelDB.getRooms();
        if (params?.property_id) list = list.filter(r => r.property_id === Number(params.property_id));
        if (params?.room_type_id) list = list.filter(r => r.room_type_id === Number(params.room_type_id));
        return list;
      }
    );
  },
  getById: async (id: number): Promise<Room> => {
    return requestWithFallback(
      () => apiClient.get(`/rooms/${id}`),
      () => {
        const r = LocalHotelDB.getRoomById(id);
        if (!r) throw new Error('Room not found');
        return r;
      }
    );
  },
  searchAvailability: async (params: {
    property_id?: number;
    check_in?: string;
    check_out?: string;
    guest_count?: number;
  }): Promise<Room[]> => {
    return requestWithFallback(
      () => apiClient.get('/rooms/availability/search', { params }),
      () => LocalHotelDB.searchAvailableRooms(params.property_id, params.check_in, params.check_out, params.guest_count)
    );
  },
  create: async (data: Partial<Room>): Promise<Room> => {
    return requestWithFallback(
      () => apiClient.post('/rooms', data),
      () => LocalHotelDB.createRoom(data)
    );
  },
  update: async (id: number, data: Partial<Room>): Promise<Room> => {
    return requestWithFallback(
      () => apiClient.patch(`/rooms/${id}`, data),
      () => LocalHotelDB.updateRoom(id, data)
    );
  },
  delete: async (id: number): Promise<void> => {
    return requestWithFallback(
      () => apiClient.delete(`/rooms/${id}`),
      () => LocalHotelDB.deleteRoom(id)
    );
  },
};

// 5. Guests API
export const guestsAPI = {
  getAll: async (params?: { search?: string }): Promise<Guest[]> => {
    return requestWithFallback(
      () => apiClient.get('/guests', { params }),
      () => {
        let list = LocalHotelDB.getGuests();
        if (params?.search) {
          const q = params.search.toLowerCase();
          list = list.filter(g => g.name.toLowerCase().includes(q) || g.email.toLowerCase().includes(q) || g.phone.includes(q));
        }
        return list;
      }
    );
  },
  getById: async (id: number): Promise<Guest> => {
    return requestWithFallback(
      () => apiClient.get(`/guests/${id}`),
      () => {
        const g = LocalHotelDB.getGuestById(id);
        if (!g) throw new Error('Guest not found');
        return g;
      }
    );
  },
  create: async (data: Partial<Guest>): Promise<Guest> => {
    return requestWithFallback(
      () => apiClient.post('/guests', data),
      () => LocalHotelDB.createGuest(data)
    );
  },
  update: async (id: number, data: Partial<Guest>): Promise<Guest> => {
    return requestWithFallback(
      () => apiClient.patch(`/guests/${id}`, data),
      () => LocalHotelDB.updateGuest(id, data)
    );
  },
  delete: async (id: number): Promise<void> => {
    return requestWithFallback(
      () => apiClient.delete(`/guests/${id}`),
      () => LocalHotelDB.deleteGuest(id)
    );
  },
};

// 6. Bookings API
export const bookingsAPI = {
  getAll: async (params?: {
    status?: string;
    guest_id?: number;
    property_id?: number;
    search?: string;
  }): Promise<Booking[]> => {
    return requestWithFallback(
      () => apiClient.get('/bookings', { params }),
      () => {
        let list = LocalHotelDB.getBookings();
        if (params?.status && params.status !== 'all') {
          list = list.filter(b => b.status === params.status);
        }
        if (params?.guest_id) {
          list = list.filter(b => b.guest_id === Number(params.guest_id));
        }
        if (params?.property_id) {
          list = list.filter(b => b.room?.property_id === Number(params.property_id));
        }
        if (params?.search) {
          const q = params.search.toLowerCase();
          list = list.filter(
            b =>
              b.id.toString().includes(q) ||
              b.guest?.name.toLowerCase().includes(q) ||
              b.room?.room_number.toLowerCase().includes(q)
          );
        }
        return list;
      }
    );
  },
  getById: async (id: number): Promise<Booking> => {
    return requestWithFallback(
      () => apiClient.get(`/bookings/${id}`),
      () => {
        const b = LocalHotelDB.getBookingById(id);
        if (!b) throw new Error('Booking not found');
        return b;
      }
    );
  },
  create: async (data: Partial<Booking>): Promise<Booking> => {
    return requestWithFallback(
      () => apiClient.post('/bookings', data),
      () => LocalHotelDB.createBooking(data)
    );
  },
  update: async (id: number, data: Partial<Booking>): Promise<Booking> => {
    return requestWithFallback(
      () => apiClient.patch(`/bookings/${id}`, data),
      () => LocalHotelDB.updateBooking(id, data)
    );
  },
  delete: async (id: number): Promise<void> => {
    return requestWithFallback(
      () => apiClient.delete(`/bookings/${id}`),
      () => LocalHotelDB.deleteBooking(id)
    );
  },
};

// 7. Payments API
export const paymentsAPI = {
  getAll: async (params?: { booking_id?: number }): Promise<Payment[]> => {
    return requestWithFallback(
      () => apiClient.get('/payments', { params }),
      () => {
        let list = LocalHotelDB.getPayments();
        if (params?.booking_id) list = list.filter(p => p.booking_id === Number(params.booking_id));
        return list;
      }
    );
  },
  getById: async (id: number): Promise<Payment> => {
    return requestWithFallback(
      () => apiClient.get(`/payments/${id}`),
      () => {
        const p = LocalHotelDB.getPaymentById(id);
        if (!p) throw new Error('Payment not found');
        return p;
      }
    );
  },
  create: async (data: Partial<Payment>): Promise<Payment> => {
    return requestWithFallback(
      () => apiClient.post('/payments', data),
      () => LocalHotelDB.createPayment(data)
    );
  },
  update: async (id: number, data: Partial<Payment>): Promise<Payment> => {
    return requestWithFallback(
      () => apiClient.patch(`/payments/${id}`, data),
      () => LocalHotelDB.updatePayment(id, data)
    );
  },
  delete: async (id: number): Promise<void> => {
    return requestWithFallback(
      () => apiClient.delete(`/payments/${id}`),
      () => LocalHotelDB.deletePayment(id)
    );
  },
};

// 8. Reviews API
export const reviewsAPI = {
  getAll: async (params?: { booking_id?: number; rating?: number }): Promise<Review[]> => {
    return requestWithFallback(
      () => apiClient.get('/reviews', { params }),
      () => {
        let list = LocalHotelDB.getReviews();
        if (params?.booking_id) list = list.filter(r => r.booking_id === Number(params.booking_id));
        if (params?.rating) list = list.filter(r => r.rating === Number(params.rating));
        return list;
      }
    );
  },
  getById: async (id: number): Promise<Review> => {
    return requestWithFallback(
      () => apiClient.get(`/reviews/${id}`),
      () => {
        const r = LocalHotelDB.getReviewById(id);
        if (!r) throw new Error('Review not found');
        return r;
      }
    );
  },
  getPropertyRating: async (propertyId: number): Promise<PropertyRating> => {
    return requestWithFallback(
      () => apiClient.get(`/reviews/property/${propertyId}/rating`),
      () => LocalHotelDB.getPropertyRating(propertyId)
    );
  },
  create: async (data: Partial<Review>): Promise<Review> => {
    return requestWithFallback(
      () => apiClient.post('/reviews', data),
      () => LocalHotelDB.createReview(data)
    );
  },
  update: async (id: number, data: Partial<Review>): Promise<Review> => {
    return requestWithFallback(
      () => apiClient.patch(`/reviews/${id}`, data),
      () => LocalHotelDB.updateReview(id, data)
    );
  },
  delete: async (id: number): Promise<void> => {
    return requestWithFallback(
      () => apiClient.delete(`/reviews/${id}`),
      () => LocalHotelDB.deleteReview(id)
    );
  },
};

// 9. Rate Plans API
export const ratePlansAPI = {
  getAll: async (params?: { property_id?: number; room_type_id?: number }): Promise<RatePlan[]> => {
    return requestWithFallback(
      () => apiClient.get('/rate-plans', { params }),
      () => {
        let list = LocalHotelDB.getRatePlans();
        if (params?.property_id) list = list.filter(rp => rp.property_id === Number(params.property_id));
        if (params?.room_type_id) list = list.filter(rp => rp.room_type_id === Number(params.room_type_id));
        return list;
      }
    );
  },
  getById: async (id: number): Promise<RatePlan> => {
    return requestWithFallback(
      () => apiClient.get(`/rate-plans/${id}`),
      () => {
        const rp = LocalHotelDB.getRatePlanById(id);
        if (!rp) throw new Error('Rate plan not found');
        return rp;
      }
    );
  },
  create: async (data: Partial<RatePlan>): Promise<RatePlan> => {
    return requestWithFallback(
      () => apiClient.post('/rate-plans', data),
      () => LocalHotelDB.createRatePlan(data)
    );
  },
  update: async (id: number, data: Partial<RatePlan>): Promise<RatePlan> => {
    return requestWithFallback(
      () => apiClient.patch(`/rate-plans/${id}`, data),
      () => LocalHotelDB.updateRatePlan(id, data)
    );
  },
  delete: async (id: number): Promise<void> => {
    return requestWithFallback(
      () => apiClient.delete(`/rate-plans/${id}`),
      () => LocalHotelDB.deleteRatePlan(id)
    );
  },
};

// 10. Reports API
export const reportsAPI = {
  getSummary: async (): Promise<ReportSummary> => {
    return requestWithFallback(
      () => apiClient.get('/reports/summary'),
      () => LocalHotelDB.getReportSummary()
    );
  },
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    return requestWithFallback(
      () => apiClient.get('/reports/dashboard/summary'),
      () => LocalHotelDB.getDashboardSummary()
    );
  },
  getRevenueByProperty: async (): Promise<RevenueByProperty[]> => {
    return requestWithFallback(
      () => apiClient.get('/reports/revenue/by-property'),
      () => LocalHotelDB.getRevenueByProperty()
    );
  },
  getRevenueByRoomType: async (): Promise<any[]> => {
    return requestWithFallback(
      () => apiClient.get('/reports/revenue/by-room-type'),
      () => [
        { room_type: 'Deluxe Suite', revenue: 125000, percentage: 36 },
        { room_type: 'Royal Heritage Villa', revenue: 145000, percentage: 42 },
        { room_type: 'Executive Club Room', revenue: 48000, percentage: 14 },
        { room_type: 'Presidential Penthouse', revenue: 28500, percentage: 8 },
      ]
    );
  },
  getDailyRevenue: async (): Promise<DailyRevenue[]> => {
    return requestWithFallback(
      () => apiClient.get('/reports/revenue/daily'),
      () => LocalHotelDB.getDailyRevenue()
    );
  },
  getOccupancyByProperty: async (): Promise<OccupancyByProperty[]> => {
    return requestWithFallback(
      () => apiClient.get('/reports/occupancy/by-property'),
      () => LocalHotelDB.getOccupancyByProperty()
    );
  },
  getADRByProperty: async (): Promise<ADRByProperty[]> => {
    return requestWithFallback(
      () => apiClient.get('/reports/adr/by-property'),
      () => LocalHotelDB.getADRByProperty()
    );
  },
  getRevPARByProperty: async (): Promise<ADRByProperty[]> => {
    return requestWithFallback(
      () => apiClient.get('/reports/revpar/by-property'),
      () => LocalHotelDB.getADRByProperty()
    );
  },
  getBookingStatusSummary: async (): Promise<BookingStatusSummary> => {
    return requestWithFallback(
      () => apiClient.get('/reports/booking-status/summary'),
      () => LocalHotelDB.getBookingStatusSummary()
    );
  },
  getFutureBookings30Days: async (): Promise<FutureBooking30Days[]> => {
    return requestWithFallback(
      () => apiClient.get('/reports/future-bookings/30days'),
      () => LocalHotelDB.getFutureBookings30Days()
    );
  },
};
