import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  DoorOpen,
  Search,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  X,
  Building,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { DataTable, Column } from '../components/DataTable';
import { GlassCard } from '../components/GlassCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { roomsAPI, propertiesAPI, roomTypesAPI } from '../services/api';
import { Room, Property, RoomType } from '../types';
import { formatCurrency } from '../lib/utils';
import { useAuthStore } from '../stores/authStore';

const roomSchema = z.object({
  property_id: z.coerce.number().min(1, 'Please select a property'),
  room_type_id: z.coerce.number().min(1, 'Please select a room type'),
  room_number: z.string().min(1, 'Room number is required'),
  status: z.enum(['available', 'occupied', 'maintenance']),
});

type RoomFormData = z.infer<typeof roomSchema>;

export const Rooms: React.FC = () => {
  const { user } = useAuthStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  // Availability Checker form state
  const [availProperty, setAvailProperty] = useState<string>('all');
  const [availCheckIn, setAvailCheckIn] = useState('2026-09-01');
  const [availCheckOut, setAvailCheckOut] = useState('2026-09-05');
  const [availGuests, setAvailGuests] = useState(2);
  const [availableResults, setAvailableResults] = useState<Room[] | null>(null);
  const [isCheckingAvail, setIsCheckingAvail] = useState(false);

  // Table Filters
  const [filterProperty, setFilterProperty] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchNumber, setSearchNumber] = useState('');

  // Dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canManage = user?.role === 'admin' || user?.role === 'manager';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema) as any,
    defaultValues: {
      status: 'available',
    },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [rList, pList, rtList] = await Promise.all([
        roomsAPI.getAll(),
        propertiesAPI.getAll(),
        roomTypesAPI.getAll(),
      ]);
      setRooms(rList);
      setProperties(pList);
      setRoomTypes(rtList);
    } catch {
      toast.error('Failed to load room inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingAvail(true);
    try {
      const params: any = {
        check_in: availCheckIn,
        check_out: availCheckOut,
        guest_count: availGuests,
      };
      if (availProperty !== 'all') {
        params.property_id = Number(availProperty);
      }
      const results = await roomsAPI.searchAvailability(params);
      setAvailableResults(results);
      toast.success(`Found ${results.length} available rooms matching criteria`);
    } catch {
      toast.error('Failed to search availability');
    } finally {
      setIsCheckingAvail(false);
    }
  };

  const openCreateDialog = () => {
    if (!canManage) {
      toast.error('Permission denied: Only Admin and Manager can add rooms');
      return;
    }
    setEditingRoom(null);
    reset({
      property_id: properties[0]?.id || 1,
      room_type_id: roomTypes[0]?.id || 1,
      room_number: '',
      status: 'available',
    });
    setIsFormOpen(true);
  };

  const openEditDialog = (room: Room) => {
    if (!canManage) {
      toast.error('Permission denied: Only Admin and Manager can edit rooms');
      return;
    }
    setEditingRoom(room);
    reset({
      property_id: room.property_id,
      room_type_id: room.room_type_id,
      room_number: room.room_number,
      status: room.status || 'available',
    });
    setIsFormOpen(true);
  };

  const onFormSubmit = async (data: RoomFormData) => {
    setSubmitting(true);
    try {
      if (editingRoom) {
        await roomsAPI.update(editingRoom.id, data);
        toast.success(`Room ${data.room_number} updated`);
      } else {
        await roomsAPI.create(data);
        toast.success(`Room ${data.room_number} created`);
      }
      setIsFormOpen(false);
      await loadData();
    } catch {
      toast.error('Failed to save room details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!deleteTargetId) return;
    setSubmitting(true);
    try {
      await roomsAPI.delete(deleteTargetId);
      toast.success('Room deleted from inventory');
      setDeleteTargetId(null);
      await loadData();
    } catch {
      toast.error('Failed to delete room');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered rooms for table
  const filteredRooms = rooms.filter((r) => {
    if (filterProperty !== 'all' && r.property_id !== Number(filterProperty)) return false;
    if (filterType !== 'all' && r.room_type_id !== Number(filterType)) return false;
    if (searchNumber.trim() && !r.room_number.toLowerCase().includes(searchNumber.toLowerCase())) {
      return false;
    }
    return true;
  });

  const columns: Column<Room>[] = [
    {
      header: 'Room Number',
      accessor: (item) => (
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-white/[0.06] border border-white/[0.1] text-indigo-400">
            <DoorOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white text-sm">Room {item.room_number}</span>
            <span className="text-[11px] text-slate-400 block">ID #{item.id}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Property',
      accessor: (item) => (
        <div>
          <span className="font-medium text-white block">{item.property?.name || 'Kaveri Estate'}</span>
          <span className="text-[11px] text-slate-400">{item.property?.city}</span>
        </div>
      ),
    },
    {
      header: 'Room Type & Capacity',
      accessor: (item) => (
        <div>
          <span className="font-medium text-indigo-300 block">{item.room_type?.name || 'Suite'}</span>
          <span className="text-[11px] text-slate-400">Max: {item.room_type?.max_occupancy || 2} guests</span>
        </div>
      ),
    },
    {
      header: 'Base Tariff',
      accessor: (item) => (
        <span className="font-semibold text-emerald-400">
          {formatCurrency(item.room_type?.base_price || 6500)}/nt
        </span>
      ),
    },
    {
      header: 'Current Status',
      accessor: (item) => {
        const isAvail = item.status === 'available';
        const isOcc = item.status === 'occupied';
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
              isAvail
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : isOcc
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAvail ? 'bg-emerald-400' : isOcc ? 'bg-amber-400' : 'bg-rose-400'
              }`}
            />
            {item.status || 'available'}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (item) =>
        canManage ? (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => openEditDialog(item)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/15 transition-colors"
              title="Edit Room"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeleteTargetId(item.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
              title="Delete Room"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-slate-500 italic">Read-only</span>
        ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Rooms & Real-Time Availability"
        subtitle="Check real-time suite occupancy, tariff configurations, and inventory status."
        action={
          canManage && (
            <button
              onClick={openCreateDialog}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Room</span>
            </button>
          )
        }
      />

      {/* Top Glass Panel: Room Availability Checker */}
      <GlassCard className="p-6 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.08]">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Live Room Availability Checker
            </h3>
            <p className="text-xs text-slate-400">
              Query instant room inventory by date range, property, and occupancy limit.
            </p>
          </div>
        </div>

        <form onSubmit={handleCheckAvailability} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Property
            </label>
            <select
              value={availProperty}
              onChange={(e) => setAvailProperty(e.target.value)}
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

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Check-in Date
            </label>
            <input
              type="date"
              value={availCheckIn}
              onChange={(e) => setAvailCheckIn(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Check-out Date
            </label>
            <input
              type="date"
              value={availCheckOut}
              onChange={(e) => setAvailCheckOut(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Guests
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={availGuests}
              onChange={(e) => setAvailGuests(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isCheckingAvail}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isCheckingAvail ? 'Searching...' : 'Check Availability'}</span>
            </button>
          </div>
        </form>

        {/* Availability Results Grid */}
        {availableResults !== null && (
          <div className="mt-6 pt-5 border-t border-white/[0.08] animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300">
                Found {availableResults.length} Available Rooms for Stay
              </span>
              <button
                onClick={() => setAvailableResults(null)}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                Clear Search
              </button>
            </div>

            {availableResults.length === 0 ? (
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center text-xs text-slate-400">
                No rooms currently available for the selected dates and occupancy. Try changing dates or property.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableResults.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-xl bg-white/[0.04] border border-emerald-500/30 hover:bg-white/[0.08] transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-white text-sm">Room {r.room_number}</span>
                      </div>
                      <span className="text-xs text-slate-300 block mt-0.5">
                        {r.room_type?.name} ({r.property?.name?.split(' ')[0]})
                      </span>
                      <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
                        {formatCurrency(r.room_type?.base_price || 6500)} / night
                      </span>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                      Available
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* Filter Bar for Table */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Filter by Property
            </label>
            <select
              value={filterProperty}
              onChange={(e) => setFilterProperty(e.target.value)}
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

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Room Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input"
            >
              <option value="all" className="bg-slate-900 text-white">All Room Types</option>
              {roomTypes.map((rt) => (
                <option key={rt.id} value={rt.id} className="bg-slate-900 text-white">
                  {rt.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Search Room Number
            </label>
            <input
              type="text"
              placeholder="e.g. 101, V-01..."
              value={searchNumber}
              onChange={(e) => setSearchNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input"
            />
          </div>
        </div>
      </GlassCard>

      {/* Rooms DataTable */}
      <DataTable
        columns={columns}
        data={filteredRooms}
        loading={loading}
        title="Complete Room Inventory"
        subtitle={`Showing ${filteredRooms.length} of ${rooms.length} total units`}
        emptyTitle="No rooms found"
        emptyDescription="Add a new room or adjust the filters above."
      />

      {/* Room Create / Edit Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />
          <GlassCard variant="elevated" className="relative w-full max-w-md p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingRoom ? `Edit Room ${editingRoom.room_number}` : 'Add New Hotel Room'}
                </h3>
                <p className="text-xs text-slate-400">Configure property assignment and type</p>
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
                  Property
                </label>
                <select {...register('property_id')} className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input">
                  {properties.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.name} ({p.city})
                    </option>
                  ))}
                </select>
                {errors.property_id && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.property_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Room Type Category
                </label>
                <select {...register('room_type_id')} className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input">
                  {roomTypes.map((rt) => (
                    <option key={rt.id} value={rt.id} className="bg-slate-900 text-white">
                      {rt.name} - Max {rt.max_occupancy} guests ({formatCurrency(rt.base_price)}/nt)
                    </option>
                  ))}
                </select>
                {errors.room_type_id && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.room_type_id.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Room Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 101, V-02"
                    {...register('room_number')}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input"
                  />
                  {errors.room_number && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.room_number.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Initial Status
                  </label>
                  <select {...register('status')} className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input">
                    <option value="available" className="bg-slate-900 text-white">Available</option>
                    <option value="occupied" className="bg-slate-900 text-white">Occupied</option>
                    <option value="maintenance" className="bg-slate-900 text-white">Maintenance</option>
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
                  {submitting ? 'Saving...' : editingRoom ? 'Save Changes' : 'Create Room'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Remove Room?"
        message="Are you sure you want to remove this room from the active estate inventory?"
        confirmLabel="Yes, Delete Room"
        onConfirm={handleDeleteRoom}
        onCancel={() => setDeleteTargetId(null)}
        isLoading={submitting}
      />
    </div>
  );
};
