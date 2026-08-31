import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Star,
  Plus,
  MessageSquare,
  Sparkles,
  Trash2,
  X,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { DataTable, Column } from '../components/DataTable';
import { GlassCard } from '../components/GlassCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { reviewsAPI, bookingsAPI, propertiesAPI } from '../services/api';
import { Review, Booking, Property, PropertyRating } from '../types';
import { formatDate } from '../lib/utils';

const reviewSchema = z.object({
  booking_id: z.coerce.number().min(1, 'Please select a valid Booking ID'),
  rating: z.coerce.number().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(3, 'Please enter a review commentary'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number>(1);
  const [propertyRating, setPropertyRating] = useState<PropertyRating | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterRating, setFilterRating] = useState<string>('all');
  const [filterBookingId, setFilterBookingId] = useState<string>('');

  // Dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema) as any,
    defaultValues: {
      booking_id: 1001,
      rating: 5,
      comment: '',
    },
  });

  const selectedRating = watch('rating') || 5;

  const loadData = async () => {
    setLoading(true);
    try {
      const [rList, bList, pList, ratingData] = await Promise.all([
        reviewsAPI.getAll(),
        bookingsAPI.getAll(),
        propertiesAPI.getAll(),
        reviewsAPI.getPropertyRating(selectedPropertyId),
      ]);
      setReviews(rList);
      setBookings(bList);
      setProperties(pList);
      setPropertyRating(ratingData);
    } catch {
      toast.error('Failed to load guest feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPropertyId]);

  const openCreateDialog = () => {
    reset({
      booking_id: bookings[0]?.id || 1001,
      rating: 5,
      comment: '',
    });
    setIsFormOpen(true);
  };

  const onFormSubmit = async (data: ReviewFormData) => {
    setSubmitting(true);
    try {
      await reviewsAPI.create(data);
      toast.success('Guest review submitted successfully');
      setIsFormOpen(false);
      await loadData();
    } catch {
      toast.error('Failed to save review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!deleteTargetId) return;
    setSubmitting(true);
    try {
      await reviewsAPI.delete(deleteTargetId);
      toast.success('Review removed');
      setDeleteTargetId(null);
      await loadData();
    } catch {
      toast.error('Failed to delete review');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered reviews
  const filteredReviews = reviews.filter((r) => {
    if (filterRating !== 'all' && r.rating !== Number(filterRating)) return false;
    if (filterBookingId.trim() && !String(r.booking_id).includes(filterBookingId.trim())) return false;
    return true;
  });

  const columns: Column<Review>[] = [
    {
      header: 'Review ID',
      accessor: (item) => (
        <span className="font-mono font-semibold text-indigo-300">#{item.id}</span>
      ),
    },
    {
      header: 'Booking Ref',
      accessor: (item) => (
        <div>
          <span className="font-semibold text-white">Booking #{item.booking_id}</span>
          <span className="text-[11px] text-slate-400 block">
            {item.booking?.guest?.name || 'Verified Stay'}
          </span>
        </div>
      ),
    },
    {
      header: 'Rating Score',
      accessor: (item) => (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star
              key={idx}
              className={`w-3.5 h-3.5 ${
                idx < item.rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-600'
              }`}
            />
          ))}
          <span className="ml-1 text-xs font-bold text-amber-300">{item.rating}.0</span>
        </div>
      ),
    },
    {
      header: 'Guest Feedback',
      accessor: (item) => (
        <p className="text-xs text-slate-300 max-w-md line-clamp-2 leading-relaxed italic">
          "{item.comment || 'No comment provided'}"
        </p>
      ),
    },
    {
      header: 'Submitted',
      accessor: (item) => (
        <span className="text-xs text-slate-400">{formatDate(item.created_at)}</span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (item) => (
        <button
          onClick={() => setDeleteTargetId(item.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
          title="Delete Review"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Guest Reviews & Ratings"
        subtitle="Track guest satisfaction scores, hospitality feedback, and property performance metrics."
        action={
          <button
            onClick={openCreateDialog}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Review</span>
          </button>
        }
      />

      {/* Property Rating Glass Panel */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08] mb-5">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Property Rating Benchmark
            </h3>
            <p className="text-xs text-slate-400">
              Aggregated satisfaction scores based on verified checkout surveys
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Select Estate:</span>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl text-xs glass-input"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Average Rating Block */}
          <div className="md:col-span-4 p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold text-white tracking-tight">
              {propertyRating?.average_rating || 4.9}
            </span>
            <div className="flex items-center gap-1 my-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-400">
              Based on {propertyRating?.total_reviews || 14} verified guest reviews
            </p>
          </div>

          {/* Rating Distribution Progress Bars */}
          <div className="md:col-span-8 space-y-2 text-xs">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count =
                propertyRating?.rating_distribution?.[
                  `stars_${stars}` as keyof typeof propertyRating.rating_distribution
                ] || (stars === 5 ? 10 : stars === 4 ? 3 : 1);
              const total = propertyRating?.total_reviews || 14;
              const percent = Math.round((count / (total || 1)) * 100);

              return (
                <div key={stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12 text-slate-300">
                    <span>{stars}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-white/[0.08] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-slate-400 font-mono text-[11px]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* Filter Bar */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Filter by Star Rating
            </label>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input"
            >
              <option value="all" className="bg-slate-900 text-white">All Ratings</option>
              <option value="5" className="bg-slate-900 text-white">5 Stars (Excellent)</option>
              <option value="4" className="bg-slate-900 text-white">4 Stars (Good)</option>
              <option value="3" className="bg-slate-900 text-white">3 Stars (Average)</option>
              <option value="2" className="bg-slate-900 text-white">2 Stars (Poor)</option>
              <option value="1" className="bg-slate-900 text-white">1 Star (Critical)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Filter by Booking Reference
            </label>
            <input
              type="text"
              placeholder="e.g. 1001, 1006..."
              value={filterBookingId}
              onChange={(e) => setFilterBookingId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input"
            />
          </div>
        </div>
      </GlassCard>

      {/* Reviews Table */}
      <DataTable
        columns={columns}
        data={filteredReviews}
        loading={loading}
        title="Guest Feedback Logs"
        subtitle={`Showing ${filteredReviews.length} guest survey records`}
        emptyTitle="No reviews recorded"
        emptyDescription="Add a new guest review to begin tracking ratings."
      />

      {/* Create Review Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />
          <GlassCard variant="elevated" className="relative w-full max-w-md p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">Record Guest Review</h3>
                <p className="text-xs text-slate-400">Log customer survey ratings and comments</p>
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
                  Booking Reference
                </label>
                <select {...register('booking_id')} className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input">
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                      Booking #{b.id} - {b.guest?.name} (Room {b.room?.room_number})
                    </option>
                  ))}
                </select>
                {errors.booking_id && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.booking_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Satisfaction Score (1 - 5 Stars)
                </label>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setValue('rating', star)}
                      className="p-2 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= selectedRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Guest Comments
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Exceptional service, scenic mountain view, delicious buffet..."
                  {...register('comment')}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input"
                />
                {errors.comment && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.comment.message}</p>
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
                  {submitting ? 'Submitting...' : 'Save Feedback'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Delete Review?"
        message="Are you sure you want to permanently delete this guest feedback record?"
        confirmLabel="Yes, Delete Review"
        onConfirm={handleDeleteReview}
        onCancel={() => setDeleteTargetId(null)}
        isLoading={submitting}
      />
    </div>
  );
};
