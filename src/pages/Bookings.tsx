import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Plus,
  Calendar,
  User as UserIcon,
  DoorOpen,
  Filter,
  Eye,
  Edit2,
  Trash2,
  X,
  CreditCard,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { DataTable, Column } from '../components/DataTable';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { bookingsAPI, guestsAPI, roomsAPI, propertiesAPI } from '../services/api';
import { Booking, Guest, Room, Property, BookingStatus } from '../types';
import { formatCurrency, formatDate, calcNights } from '../lib/utils';

const bookingFormSchema = z
  .object({
    guest_id: z.coerce.number().min(1, 'Please select or enter a valid Guest ID'),
    room_id: z.coerce.number().min(1, 'Please select or enter a valid Room ID'),
    check_in_date: z.string().min(10, 'Check-in date is required (YYYY-MM-DD)'),
    check_out_date: z.string().min(10, 'Check-out date is required (YYYY-MM-DD)'),
    guest_count: z.coerce.number().min(1, 'Guest count must be at least 1'),
    status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
  })
  .refine(
    (data) => {
      const start = new Date(data.check_in_date).getTime();
      const end = new Date(data.check_out_date).getTime();
      return end > start;
    },
    {
      message: 'Check-out date must be strictly after check-in date',
      path: ['check_out_date'],
    }
  );

type BookingFormData = z.infer<typeof bookingFormSchema>;

export const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema) as any,
    defaultValues: {
      guest_id: 1,
      room_id: 1,
      check_in_date: '2026-09-01',
      check_out_date: '2026-09-04',
      guest_count: 2,
      status: 'confirmed',
    },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [bList, gList, rList, pList] = await Promise.all([
        bookingsAPI.getAll(),
        guestsAPI.getAll(),
        roomsAPI.getAll(),
        propertiesAPI.getAll(),
      ]);
      setBookings(bList);
      setGuests(gList);
      setRooms(rList);
      setProperties(pList);
    } catch (err) {
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateDialog = () => {
    setEditingBooking(null);
    reset({
      guest_id: guests[0]?.id || 1,
      room_id: rooms[0]?.id || 1,
      check_in_date: '2026-09-01',
      check_out_date: '2026-09-04',
      guest_count: 2,
      status: 'confirmed',
    });
    setIsFormOpen(true);
  };

  const openEditDialog = (booking: Booking) => {
    setEditingBooking(booking);
    reset({
      guest_id: booking.guest_id,
      room_id: booking.room_id,
      check_in_date: booking.check_in_date,
      check_out_date: booking.check_out_date,
      guest_count: booking.guest_count,
      status: booking.status,
    });
    setIsFormOpen(true);
  };

  const onFormSubmit = async (data: BookingFormData) => {
    setSubmitting(true);
    try {
      if (editingBooking) {
        await bookingsAPI.update(editingBooking.id, data);
        toast.success(`Booking #${editingBooking.id} updated successfully`);
      } else {
        const created = await bookingsAPI.create(data);
        toast.success(`New booking #${created.id} confirmed!`);
      }
      setIsFormOpen(false);
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Error processing booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelTargetId) return;
    setSubmitting(true);
    try {
      await bookingsAPI.delete(cancelTargetId);
      toast.success(`Booking #${cancelTargetId} has been cancelled`);
      setCancelTargetId(null);
      await loadData();
    } catch {
      toast.error('Failed to cancel booking');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered List
  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (propertyFilter !== 'all' && b.room?.property_id !== Number(propertyFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = String(b.id).includes(q);
      const matchGuest = b.guest?.name.toLowerCase().includes(q) || false;
      const matchRoom = b.room?.room_number.toLowerCase().includes(q) || false;
      return matchId || matchGuest || matchRoom;
    }
    return true;
  });

  const columns: Column<Booking>[] = [
    {
      header: 'Booking ID',
      accessor: (item) => (
        <span className="font-mono font-semibold text-indigo-300">#{item.id}</span>
      ),
    },
    {
      header: 'Guest',
      accessor: (item) => (
        <div>
          <div className="font-medium text-white flex items-center gap-1.5">
            <UserIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>{item.guest?.name || `Guest #${item.guest_id}`}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">ID: {item.guest_id}</span>
        </div>
      ),
    },
    {
      header: 'Property & Room',
      accessor: (item) => (
        <div>
          <div className="font-medium text-white flex items-center gap-1.5">
            <DoorOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Room {item.room?.room_number || `#${item.room_id}`}</span>
          </div>
          <span className="text-[11px] text-slate-400 truncate block max-w-[140px]">
            {item.room?.property?.name || 'Kaveri Estate'}
          </span>
        </div>
      ),
    },
    {
      header: 'Stay Dates',
      accessor: (item) => (
        <div className="text-xs">
          <div className="text-slate-200">{formatDate(item.check_in_date)}</div>
          <div className="text-[11px] text-slate-400">to {formatDate(item.check_out_date)}</div>
        </div>
      ),
    },
    {
      header: 'Nights',
      accessor: (item) => (
        <span className="font-medium text-slate-300">
          {calcNights(item.check_in_date, item.check_out_date)} nts
        </span>
      ),
    },
    {
      header: 'Guests',
      accessor: (item) => <span className="text-slate-300">{item.guest_count} adults</span>,
    },
    {
      header: 'Amount',
      accessor: (item) => (
        <span className="font-semibold text-emerald-400">
          {item.total_amount ? formatCurrency(item.total_amount) : '₹18,000'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (item) => <StatusBadge status={item.status} />,
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setViewingBooking(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditDialog(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/15 transition-colors"
            title="Edit Booking"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {item.status !== 'cancelled' && (
            <button
              onClick={() => setCancelTargetId(item.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
              title="Cancel Booking"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <PageHeader
        title="Bookings Management"
        subtitle="Manage hotel reservations, check-ins, guest stays, and billing statuses."
        action={
          <button
            onClick={openCreateDialog}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        }
      />

      {/* Glass Filter Bar */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Filter Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input"
            >
              <option value="all" className="bg-slate-900 text-white">All Statuses</option>
              <option value="confirmed" className="bg-slate-900 text-white">Confirmed</option>
              <option value="pending" className="bg-slate-900 text-white">Pending</option>
              <option value="completed" className="bg-slate-900 text-white">Completed</option>
              <option value="cancelled" className="bg-slate-900 text-white">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Property
            </label>
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input"
            >
              <option value="all" className="bg-slate-900 text-white">All Properties</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Search by ID, Guest Name or Room
            </label>
            <input
              type="text"
              placeholder="e.g. 1001, Deshmukh, 101..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input"
            />
          </div>
        </div>
      </GlassCard>

      {/* Bookings Table */}
      <DataTable
        columns={columns}
        data={filteredBookings}
        loading={loading}
        title="Active Reservations"
        subtitle={`Showing ${filteredBookings.length} bookings`}
        emptyTitle="No bookings found"
        emptyDescription="No reservations match the selected filters. Create a new reservation to get started."
        emptyAction={
          <button
            onClick={openCreateDialog}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            + Create Booking
          </button>
        }
      />

      {/* Booking Form Dialog (Create / Edit) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />
          <GlassCard variant="elevated" className="relative w-full max-w-lg p-6 z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingBooking ? `Edit Booking #${editingBooking.id}` : 'Create New Reservation'}
                </h3>
                <p className="text-xs text-slate-400">
                  Ensure guest and room availability match hotel policies.
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Guest Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Guest Name / ID
                  </label>
                  <select {...register('guest_id')} className="w-full px-3 py-2 rounded-xl text-xs glass-input">
                    {guests.map((g) => (
                      <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                        {g.name} (ID: {g.id})
                      </option>
                    ))}
                  </select>
                  {errors.guest_id && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.guest_id.message}</p>
                  )}
                </div>

                {/* Room Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Room Assignment
                  </label>
                  <select {...register('room_id')} className="w-full px-3 py-2 rounded-xl text-xs glass-input">
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                        Room {r.room_number} - {r.room_type?.name} ({r.property?.name?.split(' ')[0]})
                      </option>
                    ))}
                  </select>
                  {errors.room_id && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.room_id.message}</p>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    {...register('check_in_date')}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  />
                  {errors.check_in_date && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.check_in_date.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    {...register('check_out_date')}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  />
                  {errors.check_out_date && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.check_out_date.message}</p>
                  )}
                </div>
              </div>

              {/* Guest Count & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Guest Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    {...register('guest_count')}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  />
                  {errors.guest_count && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.guest_count.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select {...register('status')} className="w-full px-3 py-2 rounded-xl text-xs glass-input">
                    <option value="confirmed" className="bg-slate-900 text-white">Confirmed</option>
                    <option value="pending" className="bg-slate-900 text-white">Pending</option>
                    <option value="completed" className="bg-slate-900 text-white">Completed</option>
                    <option value="cancelled" className="bg-slate-900 text-white">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold glass-button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 shadow-lg shadow-indigo-600/30"
                >
                  {submitting ? 'Saving...' : editingBooking ? 'Update Reservation' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Booking View Detail Modal */}
      {viewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={() => setViewingBooking(null)} />
          <GlassCard variant="elevated" className="relative w-full max-w-md p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Booking #{viewingBooking.id}</h3>
                <span className="text-xs text-slate-400 font-mono">Created on {viewingBooking.created_at || '2026-08-20'}</span>
              </div>
              <StatusBadge status={viewingBooking.status} />
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Guest Information</span>
                <div className="font-semibold text-white text-sm">{viewingBooking.guest?.name}</div>
                <div className="text-slate-300">{viewingBooking.guest?.email}</div>
                <div className="text-slate-400">{viewingBooking.guest?.phone}</div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Room & Estate</span>
                <div className="font-semibold text-white">{viewingBooking.room?.property?.name}</div>
                <div className="text-indigo-300 font-medium">Room {viewingBooking.room?.room_number} ({viewingBooking.room?.room_type?.name})</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 block">Check-in</span>
                  <span className="font-medium text-slate-200">{formatDate(viewingBooking.check_in_date)}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 block">Check-out</span>
                  <span className="font-medium text-slate-200">{formatDate(viewingBooking.check_out_date)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                <span className="font-medium text-slate-300">Total Billed</span>
                <span className="text-base font-bold text-emerald-400">
                  {formatCurrency(viewingBooking.total_amount || 26000)}
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setViewingBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold glass-button-secondary"
              >
                Close Details
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Confirmation Dialog for Soft Delete */}
      <ConfirmDialog
        isOpen={cancelTargetId !== null}
        title="Cancel Reservation?"
        message={`Are you sure you want to cancel booking #${cancelTargetId}? This will change the status to Cancelled and release the room inventory back to availability.`}
        confirmLabel="Yes, Cancel Booking"
        onConfirm={handleCancelBooking}
        onCancel={() => setCancelTargetId(null)}
        isLoading={submitting}
      />
    </div>
  );
};
