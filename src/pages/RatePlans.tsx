import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ClipboardList,
  Plus,
  Calendar,
  Building,
  DollarSign,
  Edit2,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { DataTable, Column } from '../components/DataTable';
import { GlassCard } from '../components/GlassCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ratePlansAPI, propertiesAPI, roomTypesAPI } from '../services/api';
import { RatePlan, Property, RoomType } from '../types';
import { formatCurrency, formatDate, calcNights } from '../lib/utils';
import { useAuthStore } from '../stores/authStore';

const ratePlanSchema = z
  .object({
    property_id: z.coerce.number().min(1, 'Please select a property'),
    room_type_id: z.coerce.number().min(1, 'Please select a room type'),
    start_date: z.string().min(10, 'Start date is required'),
    end_date: z.string().min(10, 'End date is required'),
    nightly_rate: z.coerce.number().min(1, 'Nightly rate must be greater than 0'),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_date).getTime();
      const end = new Date(data.end_date).getTime();
      return end >= start;
    },
    {
      message: 'End date must be on or after start date',
      path: ['end_date'],
    }
  );

type RatePlanFormData = z.infer<typeof ratePlanSchema>;

export const RatePlans: React.FC = () => {
  const { user } = useAuthStore();
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterProp, setFilterProp] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<RatePlan | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canManage = user?.role === 'admin' || user?.role === 'manager';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RatePlanFormData>({
    resolver: zodResolver(ratePlanSchema) as any,
    defaultValues: {
      nightly_rate: 7500,
      start_date: '2026-09-01',
      end_date: '2026-12-31',
    },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [rpList, pList, rtList] = await Promise.all([
        ratePlansAPI.getAll(),
        propertiesAPI.getAll(),
        roomTypesAPI.getAll(),
      ]);
      setRatePlans(rpList);
      setProperties(pList);
      setRoomTypes(rtList);
    } catch {
      toast.error('Failed to load seasonal rate plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateDialog = () => {
    if (!canManage) {
      toast.error('Permission denied: Only Admin and Manager can configure tariffs');
      return;
    }
    setEditingPlan(null);
    reset({
      property_id: properties[0]?.id || 1,
      room_type_id: roomTypes[0]?.id || 1,
      start_date: '2026-09-01',
      end_date: '2026-12-31',
      nightly_rate: 7500,
    });
    setIsFormOpen(true);
  };

  const openEditDialog = (plan: RatePlan) => {
    if (!canManage) {
      toast.error('Permission denied: Only Admin and Manager can edit tariffs');
      return;
    }
    setEditingPlan(plan);
    reset({
      property_id: plan.property_id,
      room_type_id: plan.room_type_id,
      start_date: plan.start_date,
      end_date: plan.end_date,
      nightly_rate: plan.nightly_rate,
    });
    setIsFormOpen(true);
  };

  const onFormSubmit = async (data: RatePlanFormData) => {
    setSubmitting(true);
    try {
      if (editingPlan) {
        await ratePlansAPI.update(editingPlan.id, data);
        toast.success(`Rate Plan #${editingPlan.id} updated`);
      } else {
        await ratePlansAPI.create(data);
        toast.success('New seasonal rate plan activated');
      }
      setIsFormOpen(false);
      await loadData();
    } catch {
      toast.error('Failed to save rate plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!deleteTargetId) return;
    setSubmitting(true);
    try {
      await ratePlansAPI.delete(deleteTargetId);
      toast.success('Rate plan deleted');
      setDeleteTargetId(null);
      await loadData();
    } catch {
      toast.error('Failed to delete rate plan');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered rate plans
  const filteredPlans = ratePlans.filter((rp) => {
    if (filterProp !== 'all' && rp.property_id !== Number(filterProp)) return false;
    if (filterType !== 'all' && rp.room_type_id !== Number(filterType)) return false;
    return true;
  });

  const columns: Column<RatePlan>[] = [
    {
      header: 'Plan ID',
      accessor: (item) => (
        <span className="font-mono font-semibold text-indigo-300">#{item.id}</span>
      ),
    },
    {
      header: 'Property Destination',
      accessor: (item) => (
        <div>
          <span className="font-semibold text-white block">{item.property?.name || 'Kaveri Estate'}</span>
          <span className="text-[11px] text-slate-400">{item.property?.city}</span>
        </div>
      ),
    },
    {
      header: 'Room Type Category',
      accessor: (item) => (
        <span className="font-medium text-indigo-300">{item.room_type?.name || 'Suite'}</span>
      ),
    },
    {
      header: 'Effective Validity',
      accessor: (item) => (
        <div className="text-xs">
          <div className="text-slate-200">{formatDate(item.start_date)}</div>
          <div className="text-[11px] text-slate-400">until {formatDate(item.end_date)}</div>
        </div>
      ),
    },
    {
      header: 'Tariff Duration',
      accessor: (item) => {
        const nts = calcNights(item.start_date, item.end_date);
        return <span className="text-slate-300 font-medium">{nts} days</span>;
      },
    },
    {
      header: 'Nightly Rate',
      accessor: (item) => (
        <span className="text-sm font-bold text-emerald-400">
          {formatCurrency(item.nightly_rate)}/nt
        </span>
      ),
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
              title="Edit Tariff"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeleteTargetId(item.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
              title="Delete Tariff"
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
        title="Rate Plans & Seasonal Tariffs"
        subtitle="Configure seasonal room pricing, peak holiday tariffs, and room category yields."
        action={
          canManage && (
            <button
              onClick={openCreateDialog}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Rate Plan</span>
            </button>
          )
        }
      />

      {/* Filter Bar */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Filter by Property
            </label>
            <select
              value={filterProp}
              onChange={(e) => setFilterProp(e.target.value)}
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
              Filter by Room Type
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
        </div>
      </GlassCard>

      {/* Rate Plans Table */}
      <DataTable
        columns={columns}
        data={filteredPlans}
        loading={loading}
        title="Active Seasonal Tariffs"
        subtitle={`Showing ${filteredPlans.length} configured rate plans`}
        emptyTitle="No rate plans found"
        emptyDescription="Create a seasonal rate plan to adjust room tariffs dynamically."
      />

      {/* Rate Plan Form Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />
          <GlassCard variant="elevated" className="relative w-full max-w-md p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingPlan ? `Edit Rate Plan #${editingPlan.id}` : 'Create Seasonal Rate Plan'}
                </h3>
                <p className="text-xs text-slate-400">Configure validity window and nightly rates</p>
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
                      {rt.name} (Base: {formatCurrency(rt.base_price)})
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
                    Start Date
                  </label>
                  <input
                    type="date"
                    {...register('start_date')}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  />
                  {errors.start_date && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.start_date.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    {...register('end_date')}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  />
                  {errors.end_date && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.end_date.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nightly Rate (₹)
                </label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  placeholder="7500"
                  {...register('nightly_rate')}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input font-mono"
                />
                {errors.nightly_rate && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.nightly_rate.message}</p>
                )}
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
                  {submitting ? 'Saving...' : editingPlan ? 'Save Changes' : 'Activate Tariff'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Delete Rate Plan?"
        message="Are you sure you want to remove this pricing plan? Standard base tariffs will apply automatically."
        confirmLabel="Yes, Delete Tariff"
        onConfirm={handleDeletePlan}
        onCancel={() => setDeleteTargetId(null)}
        isLoading={submitting}
      />
    </div>
  );
};
