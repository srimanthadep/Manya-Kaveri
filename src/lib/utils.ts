import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | undefined | null): string {
  const numericAmount = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numericAmount);
}

export function formatDate(dateString: string | Date | undefined | null): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(dateString);
  }
}

export function calcNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = end.getTime() - start.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
}

export const statusColors = {
  confirmed: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  pending: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
  },
  cancelled: {
    bg: 'bg-rose-500/15',
    text: 'text-rose-300',
    border: 'border-rose-500/30',
    dot: 'bg-rose-400',
  },
  completed: {
    bg: 'bg-indigo-500/15',
    text: 'text-indigo-300',
    border: 'border-indigo-500/30',
    dot: 'bg-indigo-400',
  },
};

export const methodLabels: Record<string, string> = {
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
};

export function exportToCSV(data: Record<string, any>[], filename: string = 'export.csv') {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((obj) =>
    headers
      .map((header) => {
        const val = obj[header];
        const stringVal = val === null || val === undefined ? '' : String(val);
        return `"${stringVal.replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
