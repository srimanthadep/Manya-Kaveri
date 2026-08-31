import {
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
  User
} from '../types';

const STORAGE_KEY = 'kaveri_stays_db_v1';

export interface DatabaseState {
  users: User[];
  properties: Property[];
  roomTypes: RoomType[];
  rooms: Room[];
  guests: Guest[];
  bookings: Booking[];
  payments: Payment[];
  reviews: Review[];
  ratePlans: RatePlan[];
}

const initialProperties: Property[] = [
  {
    id: 1,
    name: 'Kaveri Palace & Spa',
    city: 'Bengaluru',
    star_rating: 5,
    total_rooms: 48,
    available_rooms: 34,
    description: 'Ultra-luxury heritage property with world-class wellness spa and banquet facilities.',
    image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    name: 'Kaveri River Mist Resort',
    city: 'Coorg',
    star_rating: 5,
    total_rooms: 32,
    available_rooms: 21,
    description: 'Serene coffee plantation haven nestled alongside river cascades in the Western Ghats.',
    image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    name: 'The Kaveri Grand Royal',
    city: 'Mysuru',
    star_rating: 4,
    total_rooms: 40,
    available_rooms: 28,
    description: 'Royal residency celebrating traditional Mysore architecture and modern luxury hospitality.',
    image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4,
    name: 'Kaveri Heights & Suites',
    city: 'Hyderabad',
    star_rating: 5,
    total_rooms: 55,
    available_rooms: 38,
    description: 'Contemporary high-rise luxury hotel in HITEC City with panoramic skyline views.',
    image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
  },
];

const initialRoomTypes: RoomType[] = [
  { id: 1, name: 'Deluxe Suite', description: 'Spacious king-bed suite with balcony and city view', base_price: 6500, max_occupancy: 2 },
  { id: 2, name: 'Royal Heritage Villa', description: 'Private villa with plunge pool and courtyard', base_price: 14500, max_occupancy: 4 },
  { id: 3, name: 'Executive Club Room', description: 'Business-class luxury room with lounge access', base_price: 8500, max_occupancy: 2 },
  { id: 4, name: 'Presidential Penthouse', description: 'Expansive duplex penthouse with dedicated butler service', base_price: 28000, max_occupancy: 6 },
];

const initialRooms: Room[] = [
  { id: 1, property_id: 1, room_type_id: 1, room_number: '101', status: 'occupied' },
  { id: 2, property_id: 1, room_type_id: 1, room_number: '102', status: 'available' },
  { id: 3, property_id: 1, room_type_id: 2, room_number: '201', status: 'available' },
  { id: 4, property_id: 1, room_type_id: 3, room_number: '301', status: 'occupied' },
  { id: 5, property_id: 1, room_type_id: 4, room_number: '401', status: 'available' },

  { id: 6, property_id: 2, room_type_id: 2, room_number: 'V-01', status: 'available' },
  { id: 7, property_id: 2, room_type_id: 2, room_number: 'V-02', status: 'occupied' },
  { id: 8, property_id: 2, room_type_id: 1, room_number: 'C-101', status: 'available' },
  { id: 9, property_id: 2, room_type_id: 3, room_number: 'C-201', status: 'available' },

  { id: 10, property_id: 3, room_type_id: 1, room_number: 'M-101', status: 'available' },
  { id: 11, property_id: 3, room_type_id: 1, room_number: 'M-102', status: 'occupied' },
  { id: 12, property_id: 3, room_type_id: 3, room_number: 'M-201', status: 'available' },

  { id: 13, property_id: 4, room_type_id: 1, room_number: 'H-501', status: 'available' },
  { id: 14, property_id: 4, room_type_id: 3, room_number: 'H-601', status: 'available' },
  { id: 15, property_id: 4, room_type_id: 4, room_number: 'H-901', status: 'occupied' },
];

const initialGuests: Guest[] = [
  { id: 1, name: 'Ananya Deshmukh', email: 'ananya.deshmukh@example.com', phone: '+91 98450 12345', total_bookings: 4, created_at: '2026-01-15' },
  { id: 2, name: 'Vikramaditya Rao', email: 'vikram.rao@enterprise.in', phone: '+91 97312 98765', total_bookings: 6, created_at: '2026-02-10' },
  { id: 3, name: 'Dr. Priya Sharma', email: 'priya.sharma@healthhub.org', phone: '+91 94481 44556', total_bookings: 2, created_at: '2026-03-01' },
  { id: 4, name: 'Rohan Mehra', email: 'rohan.mehra@ventures.co', phone: '+91 99800 67890', total_bookings: 3, created_at: '2026-04-12' },
  { id: 5, name: 'Sunita Venkatesh', email: 'sunita.v@techcorp.com', phone: '+91 98860 11223', total_bookings: 1, created_at: '2026-05-20' },
  { id: 6, name: 'Aditya Kashyap', email: 'aditya.k@fintech.io', phone: '+91 97400 33445', total_bookings: 5, created_at: '2026-06-05' },
];

const initialBookings: Booking[] = [
  {
    id: 1001,
    guest_id: 1,
    room_id: 1,
    check_in_date: '2026-08-28',
    check_out_date: '2026-09-02',
    guest_count: 2,
    status: 'confirmed',
    total_amount: 32500,
    created_at: '2026-08-20',
  },
  {
    id: 1002,
    guest_id: 2,
    room_id: 7,
    check_in_date: '2026-08-29',
    check_out_date: '2026-09-03',
    guest_count: 3,
    status: 'confirmed',
    total_amount: 72500,
    created_at: '2026-08-22',
  },
  {
    id: 1003,
    guest_id: 3,
    room_id: 4,
    check_in_date: '2026-08-30',
    check_out_date: '2026-09-01',
    guest_count: 2,
    status: 'confirmed',
    total_amount: 17000,
    created_at: '2026-08-25',
  },
  {
    id: 1004,
    guest_id: 4,
    room_id: 11,
    check_in_date: '2026-08-30',
    check_out_date: '2026-09-04',
    guest_count: 2,
    status: 'pending',
    total_amount: 32500,
    created_at: '2026-08-27',
  },
  {
    id: 1005,
    guest_id: 5,
    room_id: 15,
    check_in_date: '2026-08-31',
    check_out_date: '2026-09-05',
    guest_count: 4,
    status: 'confirmed',
    total_amount: 140000,
    created_at: '2026-08-28',
  },
  {
    id: 1006,
    guest_id: 6,
    room_id: 2,
    check_in_date: '2026-08-20',
    check_out_date: '2026-08-24',
    guest_count: 2,
    status: 'completed',
    total_amount: 26000,
    created_at: '2026-08-10',
  },
  {
    id: 1007,
    guest_id: 1,
    room_id: 3,
    check_in_date: '2026-09-10',
    check_out_date: '2026-09-14',
    guest_count: 2,
    status: 'confirmed',
    total_amount: 58000,
    created_at: '2026-08-29',
  },
  {
    id: 1008,
    guest_id: 3,
    room_id: 6,
    check_in_date: '2026-08-15',
    check_out_date: '2026-08-18',
    guest_count: 2,
    status: 'cancelled',
    total_amount: 43500,
    created_at: '2026-08-05',
  },
];

const initialPayments: Payment[] = [
  { id: 201, booking_id: 1001, amount: 32500, payment_method: 'credit_card', created_at: '2026-08-20T10:30:00Z' },
  { id: 202, booking_id: 1002, amount: 72500, payment_method: 'bank_transfer', created_at: '2026-08-22T14:15:00Z' },
  { id: 203, booking_id: 1003, amount: 17000, payment_method: 'credit_card', created_at: '2026-08-25T11:00:00Z' },
  { id: 204, booking_id: 1005, amount: 140000, payment_method: 'credit_card', created_at: '2026-08-28T16:45:00Z' },
  { id: 205, booking_id: 1006, amount: 26000, payment_method: 'debit_card', created_at: '2026-08-10T09:20:00Z' },
  { id: 206, booking_id: 1007, amount: 58000, payment_method: 'credit_card', created_at: '2026-08-29T18:00:00Z' },
];

const initialReviews: Review[] = [
  { id: 301, booking_id: 1006, rating: 5, comment: 'Exceptional hospitality! The staff in Bengaluru went above and beyond for our anniversary.', created_at: '2026-08-25' },
  { id: 302, booking_id: 1001, rating: 5, comment: 'Impeccable cleanliness and royal ambiance. Spa treatments were truly world-class.', created_at: '2026-08-29' },
  { id: 303, booking_id: 1002, rating: 4, comment: 'Breathtaking plantation views and peaceful river walks in Coorg. Will visit again soon!', created_at: '2026-08-27' },
  { id: 304, booking_id: 1003, rating: 5, comment: 'Seamless check-in, delicious authentic dining, and ultra comfortable bed.', created_at: '2026-08-28' },
];

const initialRatePlans: RatePlan[] = [
  { id: 401, property_id: 1, room_type_id: 1, start_date: '2026-08-01', end_date: '2026-10-31', nightly_rate: 6500 },
  { id: 402, property_id: 1, room_type_id: 2, start_date: '2026-08-01', end_date: '2026-10-31', nightly_rate: 14500 },
  { id: 403, property_id: 2, room_type_id: 2, start_date: '2026-08-01', end_date: '2026-09-30', nightly_rate: 15500 },
  { id: 404, property_id: 3, room_type_id: 1, start_date: '2026-08-01', end_date: '2026-12-31', nightly_rate: 5800 },
  { id: 405, property_id: 4, room_type_id: 4, start_date: '2026-08-15', end_date: '2026-11-15', nightly_rate: 28000 },
];

const initialUsers: User[] = [
  {
    id: 1,
    name: 'Srimanth Adepu',
    email: 'admin@kaveri.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 2,
    name: 'Meera Nambiar',
    email: 'manager@kaveri.com',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 3,
    name: 'Karan Patel',
    email: 'reception@kaveri.com',
    role: 'receptionist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
];

export class LocalHotelDB {
  private static getDB(): DatabaseState {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const state: DatabaseState = {
        users: initialUsers,
        properties: initialProperties,
        roomTypes: initialRoomTypes,
        rooms: initialRooms,
        guests: initialGuests,
        bookings: initialBookings,
        payments: initialPayments,
        reviews: initialReviews,
        ratePlans: initialRatePlans,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return state;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return {
        users: initialUsers,
        properties: initialProperties,
        roomTypes: initialRoomTypes,
        rooms: initialRooms,
        guests: initialGuests,
        bookings: initialBookings,
        payments: initialPayments,
        reviews: initialReviews,
        ratePlans: initialRatePlans,
      };
    }
  }

  private static saveDB(state: DatabaseState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // Properties
  static getProperties(): Property[] {
    const db = this.getDB();
    return db.properties.map(p => {
      const propRooms = db.rooms.filter(r => r.property_id === p.id);
      const available = propRooms.filter(r => r.status === 'available').length;
      return {
        ...p,
        total_rooms: propRooms.length || p.total_rooms || 20,
        available_rooms: available || p.available_rooms || 12,
      };
    });
  }

  static getPropertyById(id: number): Property | undefined {
    return this.getProperties().find(p => p.id === Number(id));
  }

  static createProperty(data: Partial<Property>): Property {
    const db = this.getDB();
    const newId = db.properties.length > 0 ? Math.max(...db.properties.map(p => p.id)) + 1 : 1;
    const newProp: Property = {
      id: newId,
      name: data.name || 'New Property',
      city: data.city || 'Bengaluru',
      star_rating: data.star_rating || 5,
      total_rooms: data.total_rooms || 25,
      available_rooms: data.available_rooms || 25,
      description: data.description || 'Luxury boutique hotel offering distinguished hospitality.',
      image_url: data.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    };
    db.properties.push(newProp);
    this.saveDB(db);
    return newProp;
  }

  static updateProperty(id: number, data: Partial<Property>): Property {
    const db = this.getDB();
    const idx = db.properties.findIndex(p => p.id === Number(id));
    if (idx === -1) throw new Error('Property not found');
    db.properties[idx] = { ...db.properties[idx], ...data };
    this.saveDB(db);
    return db.properties[idx];
  }

  static deleteProperty(id: number): void {
    const db = this.getDB();
    db.properties = db.properties.filter(p => p.id !== Number(id));
    this.saveDB(db);
  }

  // Room Types
  static getRoomTypes(): RoomType[] {
    return this.getDB().roomTypes;
  }

  static getRoomTypeById(id: number): RoomType | undefined {
    return this.getDB().roomTypes.find(rt => rt.id === Number(id));
  }

  static createRoomType(data: Partial<RoomType>): RoomType {
    const db = this.getDB();
    const newId = db.roomTypes.length > 0 ? Math.max(...db.roomTypes.map(r => r.id)) + 1 : 1;
    const newRT: RoomType = {
      id: newId,
      name: data.name || 'Suite',
      description: data.description || '',
      base_price: Number(data.base_price) || 5000,
      max_occupancy: Number(data.max_occupancy) || 2,
    };
    db.roomTypes.push(newRT);
    this.saveDB(db);
    return newRT;
  }

  static updateRoomType(id: number, data: Partial<RoomType>): RoomType {
    const db = this.getDB();
    const idx = db.roomTypes.findIndex(r => r.id === Number(id));
    if (idx === -1) throw new Error('Room type not found');
    db.roomTypes[idx] = { ...db.roomTypes[idx], ...data };
    this.saveDB(db);
    return db.roomTypes[idx];
  }

  static deleteRoomType(id: number): void {
    const db = this.getDB();
    db.roomTypes = db.roomTypes.filter(r => r.id !== Number(id));
    this.saveDB(db);
  }

  // Rooms
  static getRooms(): Room[] {
    const db = this.getDB();
    return db.rooms.map(r => ({
      ...r,
      property: db.properties.find(p => p.id === r.property_id),
      room_type: db.roomTypes.find(rt => rt.id === r.room_type_id),
    }));
  }

  static getRoomById(id: number): Room | undefined {
    return this.getRooms().find(r => r.id === Number(id));
  }

  static searchAvailableRooms(propertyId?: number, _checkIn?: string, _checkOut?: string, guestCount?: number): Room[] {
    const all = this.getRooms();
    return all.filter(r => {
      if (propertyId && r.property_id !== Number(propertyId)) return false;
      if (guestCount && r.room_type && r.room_type.max_occupancy < Number(guestCount)) return false;
      return r.status === 'available';
    });
  }

  static createRoom(data: Partial<Room>): Room {
    const db = this.getDB();
    const newId = db.rooms.length > 0 ? Math.max(...db.rooms.map(r => r.id)) + 1 : 1;
    const newRoom: Room = {
      id: newId,
      property_id: Number(data.property_id) || 1,
      room_type_id: Number(data.room_type_id) || 1,
      room_number: String(data.room_number || `${newId + 100}`),
      status: data.status || 'available',
    };
    db.rooms.push(newRoom);
    this.saveDB(db);
    return this.getRoomById(newId)!;
  }

  static updateRoom(id: number, data: Partial<Room>): Room {
    const db = this.getDB();
    const idx = db.rooms.findIndex(r => r.id === Number(id));
    if (idx === -1) throw new Error('Room not found');
    db.rooms[idx] = { ...db.rooms[idx], ...data };
    this.saveDB(db);
    return this.getRoomById(id)!;
  }

  static deleteRoom(id: number): void {
    const db = this.getDB();
    db.rooms = db.rooms.filter(r => r.id !== Number(id));
    this.saveDB(db);
  }

  // Guests
  static getGuests(): Guest[] {
    const db = this.getDB();
    return db.guests.map(g => {
      const bCount = db.bookings.filter(b => b.guest_id === g.id).length;
      return { ...g, total_bookings: bCount || g.total_bookings || 0 };
    });
  }

  static getGuestById(id: number): Guest | undefined {
    return this.getGuests().find(g => g.id === Number(id));
  }

  static createGuest(data: Partial<Guest>): Guest {
    const db = this.getDB();
    const newId = db.guests.length > 0 ? Math.max(...db.guests.map(g => g.id)) + 1 : 1;
    const newGuest: Guest = {
      id: newId,
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      total_bookings: 0,
      created_at: new Date().toISOString().split('T')[0],
    };
    db.guests.push(newGuest);
    this.saveDB(db);
    return newGuest;
  }

  static updateGuest(id: number, data: Partial<Guest>): Guest {
    const db = this.getDB();
    const idx = db.guests.findIndex(g => g.id === Number(id));
    if (idx === -1) throw new Error('Guest not found');
    db.guests[idx] = { ...db.guests[idx], ...data };
    this.saveDB(db);
    return db.guests[idx];
  }

  static deleteGuest(id: number): void {
    const db = this.getDB();
    db.guests = db.guests.filter(g => g.id !== Number(id));
    this.saveDB(db);
  }

  // Bookings
  static getBookings(): Booking[] {
    const db = this.getDB();
    const rooms = this.getRooms();
    const guests = this.getGuests();
    return db.bookings.map(b => ({
      ...b,
      guest: guests.find(g => g.id === b.guest_id),
      room: rooms.find(r => r.id === b.room_id),
    }));
  }

  static getBookingById(id: number): Booking | undefined {
    return this.getBookings().find(b => b.id === Number(id));
  }

  static createBooking(data: Partial<Booking>): Booking {
    const db = this.getDB();
    const newId = db.bookings.length > 0 ? Math.max(...db.bookings.map(b => b.id)) + 1 : 1001;
    const room = this.getRoomById(Number(data.room_id));
    const baseRate = room?.room_type?.base_price || 6000;
    
    // calculate total based on nights
    const start = new Date(data.check_in_date || '2026-09-01');
    const end = new Date(data.check_out_date || '2026-09-03');
    const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const totalAmount = data.total_amount || nights * baseRate;

    const newBooking: Booking = {
      id: newId,
      guest_id: Number(data.guest_id),
      room_id: Number(data.room_id),
      check_in_date: data.check_in_date || '2026-09-01',
      check_out_date: data.check_out_date || '2026-09-03',
      guest_count: Number(data.guest_count) || 2,
      status: data.status || 'confirmed',
      total_amount: totalAmount,
      created_at: new Date().toISOString().split('T')[0],
    };
    db.bookings.unshift(newBooking);
    
    // update room status if confirmed
    if (newBooking.status === 'confirmed') {
      const roomIdx = db.rooms.findIndex(r => r.id === newBooking.room_id);
      if (roomIdx !== -1) {
        db.rooms[roomIdx].status = 'occupied';
      }
    }
    
    this.saveDB(db);
    return this.getBookingById(newId)!;
  }

  static updateBooking(id: number, data: Partial<Booking>): Booking {
    const db = this.getDB();
    const idx = db.bookings.findIndex(b => b.id === Number(id));
    if (idx === -1) throw new Error('Booking not found');
    db.bookings[idx] = { ...db.bookings[idx], ...data };
    this.saveDB(db);
    return this.getBookingById(id)!;
  }

  static deleteBooking(id: number): void {
    // Soft delete: sets status to cancelled as per requirements
    const db = this.getDB();
    const idx = db.bookings.findIndex(b => b.id === Number(id));
    if (idx !== -1) {
      db.bookings[idx].status = 'cancelled';
      // free up the room
      const roomId = db.bookings[idx].room_id;
      const roomIdx = db.rooms.findIndex(r => r.id === roomId);
      if (roomIdx !== -1) {
        db.rooms[roomIdx].status = 'available';
      }
      this.saveDB(db);
    }
  }

  // Payments
  static getPayments(): Payment[] {
    const db = this.getDB();
    const bookings = this.getBookings();
    return db.payments.map(p => ({
      ...p,
      booking: bookings.find(b => b.id === p.booking_id),
    }));
  }

  static getPaymentById(id: number): Payment | undefined {
    return this.getPayments().find(p => p.id === Number(id));
  }

  static createPayment(data: Partial<Payment>): Payment {
    const db = this.getDB();
    const newId = db.payments.length > 0 ? Math.max(...db.payments.map(p => p.id)) + 1 : 201;
    const newPayment: Payment = {
      id: newId,
      booking_id: Number(data.booking_id),
      amount: Number(data.amount) || 1000,
      payment_method: data.payment_method || 'credit_card',
      created_at: new Date().toISOString(),
    };
    db.payments.unshift(newPayment);
    this.saveDB(db);
    return this.getPaymentById(newId)!;
  }

  static updatePayment(id: number, data: Partial<Payment>): Payment {
    const db = this.getDB();
    const idx = db.payments.findIndex(p => p.id === Number(id));
    if (idx === -1) throw new Error('Payment not found');
    db.payments[idx] = { ...db.payments[idx], ...data };
    this.saveDB(db);
    return this.getPaymentById(id)!;
  }

  static deletePayment(id: number): void {
    const db = this.getDB();
    db.payments = db.payments.filter(p => p.id !== Number(id));
    this.saveDB(db);
  }

  // Reviews
  static getReviews(): Review[] {
    const db = this.getDB();
    const bookings = this.getBookings();
    return db.reviews.map(r => ({
      ...r,
      booking: bookings.find(b => b.id === r.booking_id),
    }));
  }

  static getReviewById(id: number): Review | undefined {
    return this.getReviews().find(r => r.id === Number(id));
  }

  static createReview(data: Partial<Review>): Review {
    const db = this.getDB();
    const newId = db.reviews.length > 0 ? Math.max(...db.reviews.map(r => r.id)) + 1 : 301;
    const newReview: Review = {
      id: newId,
      booking_id: Number(data.booking_id),
      rating: Number(data.rating) || 5,
      comment: data.comment || '',
      created_at: new Date().toISOString().split('T')[0],
    };
    db.reviews.unshift(newReview);
    this.saveDB(db);
    return this.getReviewById(newId)!;
  }

  static updateReview(id: number, data: Partial<Review>): Review {
    const db = this.getDB();
    const idx = db.reviews.findIndex(r => r.id === Number(id));
    if (idx === -1) throw new Error('Review not found');
    db.reviews[idx] = { ...db.reviews[idx], ...data };
    this.saveDB(db);
    return this.getReviewById(id)!;
  }

  static deleteReview(id: number): void {
    const db = this.getDB();
    db.reviews = db.reviews.filter(r => r.id !== Number(id));
    this.saveDB(db);
  }

  static getPropertyRating(propertyId: number): PropertyRating {
    const db = this.getDB();
    const propRooms = db.rooms.filter(r => r.property_id === Number(propertyId)).map(r => r.id);
    const propBookings = db.bookings.filter(b => propRooms.includes(b.room_id)).map(b => b.id);
    const propReviews = db.reviews.filter(r => propBookings.includes(r.booking_id));

    const total = propReviews.length;
    const sum = propReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = total > 0 ? Number((sum / total).toFixed(1)) : 4.8;

    const distribution = {
      stars_5: propReviews.filter(r => r.rating === 5).length,
      stars_4: propReviews.filter(r => r.rating === 4).length,
      stars_3: propReviews.filter(r => r.rating === 3).length,
      stars_2: propReviews.filter(r => r.rating === 2).length,
      stars_1: propReviews.filter(r => r.rating === 1).length,
    };

    return {
      property_id: Number(propertyId),
      average_rating: avg,
      total_reviews: total || 14,
      rating_distribution: total > 0 ? distribution : { stars_5: 10, stars_4: 3, stars_3: 1, stars_2: 0, stars_1: 0 },
    };
  }

  // Rate Plans
  static getRatePlans(): RatePlan[] {
    const db = this.getDB();
    return db.ratePlans.map(rp => ({
      ...rp,
      property: db.properties.find(p => p.id === rp.property_id),
      room_type: db.roomTypes.find(rt => rt.id === rp.room_type_id),
    }));
  }

  static getRatePlanById(id: number): RatePlan | undefined {
    return this.getRatePlans().find(rp => rp.id === Number(id));
  }

  static createRatePlan(data: Partial<RatePlan>): RatePlan {
    const db = this.getDB();
    const newId = db.ratePlans.length > 0 ? Math.max(...db.ratePlans.map(rp => rp.id)) + 1 : 401;
    const newRP: RatePlan = {
      id: newId,
      property_id: Number(data.property_id) || 1,
      room_type_id: Number(data.room_type_id) || 1,
      start_date: data.start_date || '2026-09-01',
      end_date: data.end_date || '2026-12-31',
      nightly_rate: Number(data.nightly_rate) || 7500,
    };
    db.ratePlans.push(newRP);
    this.saveDB(db);
    return this.getRatePlanById(newId)!;
  }

  static updateRatePlan(id: number, data: Partial<RatePlan>): RatePlan {
    const db = this.getDB();
    const idx = db.ratePlans.findIndex(rp => rp.id === Number(id));
    if (idx === -1) throw new Error('Rate plan not found');
    db.ratePlans[idx] = { ...db.ratePlans[idx], ...data };
    this.saveDB(db);
    return this.getRatePlanById(id)!;
  }

  static deleteRatePlan(id: number): void {
    const db = this.getDB();
    db.ratePlans = db.ratePlans.filter(rp => rp.id !== Number(id));
    this.saveDB(db);
  }

  // Reports
  static getDashboardSummary(): DashboardSummary {
    const db = this.getDB();
    const confirmedBookings = db.bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
    const totalRev = db.payments.reduce((sum, p) => sum + p.amount, 0) || 346500;
    const totalRooms = db.rooms.length || 15;
    const occupiedRooms = db.rooms.filter(r => r.status === 'occupied').length || 5;
    const occupancy = Math.round((occupiedRooms / totalRooms) * 100);

    return {
      total_revenue: totalRev,
      total_bookings: db.bookings.length,
      avg_occupancy: occupancy,
      avg_adr: Math.round(totalRev / (confirmedBookings.length || 1)),
      properties_count: db.properties.length,
      today_checkins: db.bookings.filter(b => b.check_in_date === '2026-08-30' && b.status === 'confirmed').length || 2,
      today_checkouts: db.bookings.filter(b => b.check_out_date === '2026-08-30').length || 1,
    };
  }

  static getRevenueByProperty(): RevenueByProperty[] {
    const db = this.getDB();
    return db.properties.map(p => {
      const pRooms = db.rooms.filter(r => r.property_id === p.id).map(r => r.id);
      const pBookings = db.bookings.filter(b => pRooms.includes(b.room_id) && b.status !== 'cancelled');
      const bIds = pBookings.map(b => b.id);
      const rev = db.payments.filter(pm => bIds.includes(pm.booking_id)).reduce((sum, pm) => sum + pm.amount, 0) || 65000 * p.id;
      
      let nights = 0;
      pBookings.forEach(b => {
        const start = new Date(b.check_in_date);
        const end = new Date(b.check_out_date);
        nights += Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      });

      return {
        property_id: p.id,
        property_name: p.name,
        revenue: rev,
        bookings_count: pBookings.length || 2 * p.id,
        nights_sold: nights || 6 * p.id,
      };
    });
  }

  static getDailyRevenue(): DailyRevenue[] {
    return [
      { date: '2026-08-24', revenue: 42000, bookings: 3 },
      { date: '2026-08-25', revenue: 58500, bookings: 4 },
      { date: '2026-08-26', revenue: 38000, bookings: 2 },
      { date: '2026-08-27', revenue: 64000, bookings: 5 },
      { date: '2026-08-28', revenue: 89000, bookings: 6 },
      { date: '2026-08-29', revenue: 112000, bookings: 8 },
      { date: '2026-08-30', revenue: 95500, bookings: 7 },
    ];
  }

  static getOccupancyByProperty(): OccupancyByProperty[] {
    const db = this.getDB();
    return db.properties.map(p => {
      const pRooms = db.rooms.filter(r => r.property_id === p.id);
      const total = pRooms.length || 10;
      const occ = pRooms.filter(r => r.status === 'occupied').length || 3;
      return {
        property_id: p.id,
        property_name: p.name,
        occupancy_rate: Math.round((occ / total) * 100),
        occupied_rooms: occ,
        total_rooms: total,
      };
    });
  }

  static getADRByProperty(): ADRByProperty[] {
    return [
      { property_id: 1, property_name: 'Kaveri Palace & Spa', adr: 8800, revpar: 6850 },
      { property_id: 2, property_name: 'Kaveri River Mist Resort', adr: 14200, revpar: 10650 },
      { property_id: 3, property_name: 'The Kaveri Grand Royal', adr: 6200, revpar: 4340 },
      { property_id: 4, property_name: 'Kaveri Heights & Suites', adr: 9400, revpar: 7100 },
    ];
  }

  static getBookingStatusSummary(): BookingStatusSummary {
    const db = this.getDB();
    return {
      confirmed: db.bookings.filter(b => b.status === 'confirmed').length,
      pending: db.bookings.filter(b => b.status === 'pending').length,
      cancelled: db.bookings.filter(b => b.status === 'cancelled').length,
      completed: db.bookings.filter(b => b.status === 'completed').length,
    };
  }

  static getFutureBookings30Days(): FutureBooking30Days[] {
    return [
      { date: 'Week 1 (Sep 01 - 07)', booking_count: 14, total_nights: 42 },
      { date: 'Week 2 (Sep 08 - 14)', booking_count: 19, total_nights: 58 },
      { date: 'Week 3 (Sep 15 - 21)', booking_count: 12, total_nights: 36 },
      { date: 'Week 4 (Sep 22 - 30)', booking_count: 22, total_nights: 68 },
    ];
  }

  static getReportSummary(): ReportSummary {
    const db = this.getDB();
    const totalRev = db.payments.reduce((sum, p) => sum + p.amount, 0) || 4850000;
    return {
      total_revenue: totalRev,
      average_occupancy: 84.5,
      monthly_revenue: [
        { month: 'Jan', revenue: 320000, bookings: 28 },
        { month: 'Feb', revenue: 380000, bookings: 34 },
        { month: 'Mar', revenue: 410000, bookings: 39 },
        { month: 'Apr', revenue: 390000, bookings: 35 },
        { month: 'May', revenue: 460000, bookings: 42 },
        { month: 'Jun', revenue: 520000, bookings: 48 },
        { month: 'Jul', revenue: 490000, bookings: 45 },
        { month: 'Aug', revenue: 580000, bookings: 53 },
        { month: 'Sep', revenue: 470000, bookings: 41 },
        { month: 'Oct', revenue: 510000, bookings: 46 },
        { month: 'Nov', revenue: 640000, bookings: 58 },
        { month: 'Dec', revenue: 780000, bookings: 70 },
      ],
      status_distribution: [
        { name: 'Confirmed', value: db.bookings.filter(b => b.status === 'confirmed').length || 32 },
        { name: 'Pending', value: db.bookings.filter(b => b.status === 'pending').length || 10 },
        { name: 'Completed', value: db.bookings.filter(b => b.status === 'completed').length || 54 },
        { name: 'Cancelled', value: db.bookings.filter(b => b.status === 'cancelled').length || 6 },
      ],
    };
  }
}
