import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  X,
  User as UserIcon,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { DataTable, Column } from '../components/DataTable';
import { GlassCard } from '../components/GlassCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { guestsAPI, bookingsAPI } from '../services/api';
import { Guest, Booking } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate, formatCurrency } from '../lib/utils';

const guestSchema = z.object({
  name: z.string().min(2, 'Guest name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
});

type GuestFormData = z.infer<typeof guestSchema>;

export const Guests: React.FC = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Dialog & Drawer States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [gList, bList] = await Promise.all([guestsAPI.getAll(), bookingsAPI.getAll()]);
      setGuests(gList);
      setBookings(bList);
    } catch {
      toast.error('Failed to load guest directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateDialog = () => {
    setEditingGuest(null);
    reset({ name: '', email: '', phone: '' });
    setIsFormOpen(true);
  };

  const openEditDialog = (guest: Guest) => {
    setEditingGuest(guest);
    reset({
      name: guest.name,
      email: guest.email,
      phone: guest.phone,
    });
    setIsFormOpen(true);
  };

  const onFormSubmit = async (data: GuestFormData) => {
    setSubmitting(true);
    try {
      if (editingGuest) {
        await guestsAPI.update(editingGuest.id, data);
        toast.success(`Guest profile for ${data.name} updated`);
      } else {
        await guestsAPI.create(data);
        toast.success(`Guest ${data.name} registered successfully`);
      }
      setIsFormOpen(false);
      await loadData();
    } catch {
      toast.error('Failed to save guest profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGuest = async () => {
    if (!deleteTargetId) return;
    setSubmitting(true);
    try {
      await guestsAPI.delete(deleteTargetId);
      toast.success('Guest removed from directory');
      setDeleteTargetId(null);
      await loadData();
    } catch {
      toast.error('Failed to remove guest');
    } finally {
      setSubmitting(false);
    }
  };

  const guestBookings = selectedGuest
    ? bookings.filter((b) => b.guest_id === selectedGuest.id)
    : [];

  const columns: Column<Guest>[] = [
    {
      header: 'Guest ID',
      accessor: (item) => <span className="font-mono text-indigo-300">#{item.id}</span>,
    },
    {
      header: 'Full Name',
      accessor: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500/30 to-violet-500/30 border border-indigo-400/30 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {item.name.charAt(0)}
          </div>
          <div>
            <span className="font-semibold text-white block">{item.name}</span>
            <span className="text-[11px] text-slate-400">Registered {item.created_at || '2026-01-15'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Email Address',
      accessor: (item) => (
        <div className="flex items-center gap-1.5 text-slate-300">
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          <span>{item.email}</span>
        </div>
      ),
    },
    {
      header: 'Phone Number',
      accessor: (item) => (
        <div className="flex items-center gap-1.5 text-slate-300 font-mono text-xs">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span>{item.phone}</span>
        </div>
      ),
    },
    {
      header: 'Total Stays',
      accessor: (item) => (
        <span className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-xs font-semibold text-amber-300">
          {item.total_bookings || 0} stays
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setSelectedGuest(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="View History Drawer"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditDialog(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/15 transition-colors"
            title="Edit Guest"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTargetId(item.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
            title="Delete Guest"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Guest Directory"
        subtitle="Manage guest profiles, loyalty histories, contact details, and reservation records."
        action={
          <button
            onClick={openCreateDialog}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Guest</span>
          </button>
        }
      />

      {/* Guest Table */}
      <DataTable
        columns={columns}
        data={guests}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search guest by name, email, phone..."
        title="Registered Guests"
        subtitle={`Total registered: ${guests.length}`}
        emptyTitle="No guests found"
        emptyDescription="Add your first guest profile to start organizing stay histories."
      />

      {/* Guest Form Dialog (Create / Edit) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />
          <GlassCard variant="elevated" className="relative w-full max-w-md p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingGuest ? 'Edit Guest Profile' : 'Register New Guest'}
                </h3>
                <p className="text-xs text-slate-400">Enter primary contact information</p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Priya Sharma"
                  {...register('name')}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input"
                />
                {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="priya.sharma@domain.com"
                  {...register('email')}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input"
                />
                {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+91 98450 12345"
                  {...register('phone')}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input font-mono"
                />
                {errors.phone && <p className="text-[11px] text-rose-400 mt-1">{errors.phone.message}</p>}
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
                  {submitting ? 'Saving...' : editingGuest ? 'Save Changes' : 'Create Guest'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Guest Detail Drawer */}
      {selectedGuest && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedGuest(null)} />
          <div className="relative w-full max-w-md bg-slate-950/90 backdrop-blur-2xl border-l border-white/[0.12] p-6 z-10 shadow-2xl overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500/20 to-indigo-500/30 border border-amber-500/30 flex items-center justify-center text-sm font-bold text-white">
                    {selectedGuest.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedGuest.name}</h3>
                    <span className="text-xs text-indigo-300 font-mono">Guest #{selectedGuest.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedGuest(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Guest Profile Card */}
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-2.5 mb-6 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>{selectedGuest.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-mono">
                  <Phone className="w-4 h-4 text-indigo-400" />
                  <span>{selectedGuest.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 pt-2 border-t border-white/[0.06]">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Member since {selectedGuest.created_at || '2026-01-15'}</span>
                </div>
              </div>

              {/* Reservation History */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Booking History ({guestBookings.length})
                </h4>

                {guestBookings.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No bookings recorded yet for this guest.</p>
                ) : (
                  <div className="space-y-3">
                    {guestBookings.map((b) => (
                      <div
                        key={b.id}
                        className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">Booking #{b.id}</span>
                          <StatusBadge status={b.status} />
                        </div>
                        <div className="text-slate-300">
                          {formatDate(b.check_in_date)} — {formatDate(b.check_out_date)}
                        </div>
                        <div className="flex items-center justify-between pt-1 text-[11px]">
                          <span className="text-slate-400">{b.guest_count} Guests</span>
                          <span className="font-bold text-emerald-400">
                            {formatCurrency(b.total_amount || 18000)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.08]">
              <button
                onClick={() => setSelectedGuest(null)}
                className="w-full py-2.5 rounded-xl text-xs font-semibold glass-button-secondary"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Remove Guest Record?"
        message="Are you sure you want to delete this guest profile? This action will permanently delete the record."
        confirmLabel="Yes, Delete Guest"
        onConfirm={handleDeleteGuest}
        onCancel={() => setDeleteTargetId(null)}
        isLoading={submitting}
      />
    </div>
  );
};
