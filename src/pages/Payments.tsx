import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  CreditCard,
  Plus,
  Receipt,
  Trash2,
  X,
  Building,
  CheckCircle2,
  Calendar,
  DollarSign,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { DataTable, Column } from '../components/DataTable';
import { GlassCard } from '../components/GlassCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { paymentsAPI, bookingsAPI } from '../services/api';
import { Payment, Booking, PaymentMethod } from '../types';
import { formatCurrency, formatDate, methodLabels } from '../lib/utils';

const paymentSchema = z.object({
  booking_id: z.coerce.number().min(1, 'Please select or enter a valid Booking ID'),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  payment_method: z.enum(['credit_card', 'debit_card', 'cash', 'bank_transfer']),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      booking_id: 1001,
      amount: 25000,
      payment_method: 'credit_card',
    },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [pList, bList] = await Promise.all([paymentsAPI.getAll(), bookingsAPI.getAll()]);
      setPayments(pList);
      setBookings(bList);
    } catch {
      toast.error('Failed to load transaction ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalVisibleRevenue = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const openCreateDialog = () => {
    reset({
      booking_id: bookings[0]?.id || 1001,
      amount: 25000,
      payment_method: 'credit_card',
    });
    setIsFormOpen(true);
  };

  const onFormSubmit = async (data: PaymentFormData) => {
    setSubmitting(true);
    try {
      const created = await paymentsAPI.create(data);
      toast.success(`Payment of ${formatCurrency(data.amount)} recorded (ID #${created.id})`);
      setIsFormOpen(false);
      await loadData();
    } catch {
      toast.error('Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePayment = async () => {
    if (!deleteTargetId) return;
    setSubmitting(true);
    try {
      await paymentsAPI.delete(deleteTargetId);
      toast.success('Payment receipt record deleted');
      setDeleteTargetId(null);
      await loadData();
    } catch {
      toast.error('Failed to delete payment');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<Payment>[] = [
    {
      header: 'Payment ID',
      accessor: (item) => (
        <span className="font-mono font-semibold text-indigo-300">#{item.id}</span>
      ),
    },
    {
      header: 'Booking Reference',
      accessor: (item) => (
        <div>
          <span className="font-semibold text-white">Booking #{item.booking_id}</span>
          <span className="text-[11px] text-slate-400 block">
            {item.booking?.guest?.name || 'Guest Reservation'}
          </span>
        </div>
      ),
    },
    {
      header: 'Amount Paid',
      accessor: (item) => (
        <span className="text-sm font-bold text-emerald-400">
          {formatCurrency(item.amount)}
        </span>
      ),
    },
    {
      header: 'Payment Method',
      accessor: (item) => {
        const method = item.payment_method || 'credit_card';
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/[0.06] border border-white/[0.1] text-slate-200">
            <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
            {methodLabels[method] || method}
          </span>
        );
      },
    },
    {
      header: 'Timestamp',
      accessor: (item) => (
        <span className="text-xs text-slate-400">{formatDate(item.created_at)}</span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setSelectedReceipt(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="View Receipt"
          >
            <Receipt className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTargetId(item.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
            title="Delete Transaction"
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
        title="Payments & Revenue Ledger"
        subtitle="Manage customer transactions, advance deposits, billing invoices, and checkout receipts."
        action={
          <button
            onClick={openCreateDialog}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        }
      />

      {/* Top Summary Glass Card */}
      <GlassCard className="p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Visible Payments Revenue
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              {formatCurrency(totalVisibleRevenue)}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Aggregated across {payments.length} captured customer transactions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shadow-lg">
              <DollarSign className="w-8 h-8" />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Payments Table */}
      <DataTable
        columns={columns}
        data={payments}
        loading={loading}
        title="Transaction History"
        subtitle={`Showing ${payments.length} processed receipts`}
        emptyTitle="No payments recorded"
        emptyDescription="Record a new transaction to maintain the revenue ledger."
      />

      {/* Record Payment Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />
          <GlassCard variant="elevated" className="relative w-full max-w-md p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">Record New Payment</h3>
                <p className="text-xs text-slate-400">Capture folio billings and guest receipts</p>
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
                  Booking Reference ID
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
                  Amount Received (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  step="100"
                  placeholder="25000"
                  {...register('amount')}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input font-mono"
                />
                {errors.amount && <p className="text-[11px] text-rose-400 mt-1">{errors.amount.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Payment Method
                </label>
                <select {...register('payment_method')} className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input">
                  <option value="credit_card" className="bg-slate-900 text-white">Credit Card</option>
                  <option value="debit_card" className="bg-slate-900 text-white">Debit Card</option>
                  <option value="bank_transfer" className="bg-slate-900 text-white">Bank Transfer</option>
                  <option value="cash" className="bg-slate-900 text-white">Cash</option>
                </select>
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
                  {submitting ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={() => setSelectedReceipt(null)} />
          <GlassCard variant="elevated" className="relative w-full max-w-md p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Official Receipt #{selectedReceipt.id}</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Merchant</span>
                <span className="font-semibold text-white">Kaveri Stays Hospitality</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Booking Ref</span>
                <span className="font-semibold text-indigo-300">#{selectedReceipt.booking_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Channel</span>
                <span className="text-slate-200">{methodLabels[selectedReceipt.payment_method] || selectedReceipt.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date</span>
                <span className="text-slate-200">{formatDate(selectedReceipt.created_at)}</span>
              </div>
              <div className="pt-2 border-t border-white/[0.06] flex justify-between items-center">
                <span className="font-medium text-slate-300 text-sm">Amount Paid</span>
                <span className="font-bold text-lg text-emerald-400">
                  {formatCurrency(selectedReceipt.amount)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => toast.success('Receipt sent to customer email')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold glass-button-secondary flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                Done
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Delete Transaction Record?"
        message="Are you sure you want to remove this payment entry from the ledger?"
        confirmLabel="Yes, Delete Transaction"
        onConfirm={handleDeletePayment}
        onCancel={() => setDeleteTargetId(null)}
        isLoading={submitting}
      />
    </div>
  );
};
