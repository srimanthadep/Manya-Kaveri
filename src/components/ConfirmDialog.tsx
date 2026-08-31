import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onCancel}
      />

      {/* Modal Dialog */}
      <GlassCard variant="elevated" className="relative w-full max-w-md p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl border backdrop-blur-md shrink-0 ${
              isDestructive
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">{message}</p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl text-sm font-medium glass-button-secondary"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg ${
                  isDestructive
                    ? 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-rose-900/40'
                    : 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-indigo-900/40'
                }`}
              >
                {isLoading ? 'Processing...' : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
