import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Building2,
  MapPin,
  Star,
  DoorOpen,
  Plus,
  Edit2,
  Trash2,
  X,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { GlassCard } from '../components/GlassCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { propertiesAPI, roomsAPI } from '../services/api';
import { Property, Room } from '../types';
import { useAuthStore } from '../stores/authStore';

const propertySchema = z.object({
  name: z.string().min(3, 'Hotel name must be at least 3 characters'),
  city: z.string().min(2, 'City is required'),
  star_rating: z.coerce.number().min(1).max(5, 'Star rating must be between 1 and 5'),
  total_rooms: z.coerce.number().min(1, 'Total rooms must be at least 1'),
  description: z.string().optional(),
  image_url: z.string().url('Please enter a valid image URL').optional().or(z.literal('')),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export const Properties: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialogs & Actions
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProp, setEditingProp] = useState<Property | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canManage = user?.role === 'admin' || user?.role === 'manager';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema) as any,
    defaultValues: {
      star_rating: 5,
    },
  });

  const selectedStars = watch('star_rating') || 5;

  const loadData = async () => {
    setLoading(true);
    try {
      const [pList, rList] = await Promise.all([propertiesAPI.getAll(), roomsAPI.getAll()]);
      setProperties(pList);
      setRooms(rList);
    } catch {
      toast.error('Failed to load luxury properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateDialog = () => {
    if (!canManage) {
      toast.error('Permission denied: Only Admin and Manager can create properties');
      return;
    }
    setEditingProp(null);
    reset({
      name: '',
      city: 'Bengaluru',
      star_rating: 5,
      total_rooms: 30,
      description: 'Distinguished luxury retreat offering premier hospitality and wellness experiences.',
      image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    });
    setIsFormOpen(true);
  };

  const openEditDialog = (prop: Property) => {
    if (!canManage) {
      toast.error('Permission denied: Only Admin and Manager can edit properties');
      return;
    }
    setEditingProp(prop);
    reset({
      name: prop.name,
      city: prop.city,
      star_rating: prop.star_rating,
      total_rooms: prop.total_rooms || 30,
      description: prop.description || '',
      image_url: prop.image_url || '',
    });
    setIsFormOpen(true);
  };

  const onFormSubmit = async (data: PropertyFormData) => {
    setSubmitting(true);
    try {
      if (editingProp) {
        await propertiesAPI.update(editingProp.id, data);
        toast.success(`Property "${data.name}" updated`);
      } else {
        await propertiesAPI.create(data);
        toast.success(`New luxury estate "${data.name}" added`);
      }
      setIsFormOpen(false);
      await loadData();
    } catch {
      toast.error('Failed to save property');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProperty = async () => {
    if (!deleteTargetId) return;
    setSubmitting(true);
    try {
      await propertiesAPI.delete(deleteTargetId);
      toast.success('Property removed');
      setDeleteTargetId(null);
      await loadData();
    } catch {
      toast.error('Failed to delete property');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Luxury Estates & Hotels"
        subtitle="Manage five-star resort destinations, heritage palaces, and city suite properties."
        action={
          canManage && (
            <button
              onClick={openCreateDialog}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Property</span>
            </button>
          )
        }
      />

      {/* Glass Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {properties.map((prop) => {
          const propRooms = rooms.filter((r) => r.property_id === prop.id);
          const availableCount = propRooms.filter((r) => r.status === 'available').length;
          const totalCount = propRooms.length || prop.total_rooms || 20;

          return (
            <GlassCard
              key={prop.id}
              className="group overflow-hidden flex flex-col justify-between hover:border-white/[0.22] hover:-translate-y-1 transition-all duration-300 !p-0"
            >
              <div>
                {/* Property Image Header */}
                <div className="relative h-48 w-full overflow-hidden bg-[#0A0A0C]">
                  <img
                    src={
                      prop.image_url ||
                      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={prop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent" />

                  <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#080808]/80 border border-white/[0.15] text-xs font-bold text-white">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{prop.city}</span>
                  </div>

                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    {Array.from({ length: prop.star_rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                      {prop.name}
                    </h3>
                  </div>
                </div>

                {/* Property Body */}
                <div className="p-5 space-y-4">
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {prop.description || 'Ultra-luxury heritage property with world-class wellness spa and banquet facilities.'}
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-2xl bg-[#141416] border border-white/[0.06] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Total Rooms</span>
                        <span className="text-base font-bold text-white">{totalCount} Rooms</span>
                      </div>
                      <Building2 className="w-5 h-5 text-indigo-400 opacity-60" />
                    </div>

                    <div className="p-3 rounded-2xl bg-[#141416] border border-emerald-500/20 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-emerald-400/80 uppercase tracking-wider block">Available</span>
                        <span className="text-base font-bold text-emerald-300">{availableCount || prop.available_rooms || 12} Ready</span>
                      </div>
                      <DoorOpen className="w-5 h-5 text-emerald-400 opacity-60" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Footer Actions */}
              <div className="px-5 py-3.5 bg-[#0E0E10] border-t border-white/[0.06] flex items-center justify-between">
                <button
                  onClick={() => navigate('/rooms')}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-white transition-colors"
                >
                  <span>View Rooms</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {canManage && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditDialog(prop)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-indigo-300 hover:bg-white/[0.08] transition-colors cursor-pointer"
                      title="Edit Property"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(prop.id)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer"
                      title="Delete Property"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Property Create / Edit Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />
          <GlassCard variant="elevated" className="relative w-full max-w-lg p-6 z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingProp ? `Edit Property: ${editingProp.name}` : 'Add New Luxury Property'}
                </h3>
                <p className="text-xs text-slate-400">Configure estate details and star rating</p>
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
                  Hotel Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kaveri Palace & Spa"
                  {...register('name')}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input"
                />
                {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    City Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru, Coorg, Mysuru..."
                    {...register('city')}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input"
                  />
                  {errors.city && <p className="text-[11px] text-rose-400 mt-1">{errors.city.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Star Rating (1 - 5)
                  </label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setValue('star_rating', star)}
                        className="p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= selectedStars
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of amenities, history, location..."
                  {...register('description')}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Hero Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  {...register('image_url')}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input"
                />
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
                  {submitting ? 'Saving...' : editingProp ? 'Save Changes' : 'Create Property'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Delete Hotel Property?"
        message="Are you sure you want to remove this property? All associated rooms and future allocations will be impacted."
        confirmLabel="Yes, Delete Property"
        onConfirm={handleDeleteProperty}
        onCancel={() => setDeleteTargetId(null)}
        isLoading={submitting}
      />
    </div>
  );
};
