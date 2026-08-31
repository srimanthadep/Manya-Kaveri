import React from 'react';
import { BookingStatus } from '../types';
import { statusColors } from '../lib/utils';
import { cn } from '../lib/utils';

interface StatusBadgeProps {
  status: BookingStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const normStatus = (status?.toLowerCase() || 'pending') as keyof typeof statusColors;
  const config = statusColors[normStatus] || statusColors.pending;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border backdrop-blur-md whitespace-nowrap',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {status}
    </span>
  );
};
