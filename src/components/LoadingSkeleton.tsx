import React from 'react';
import { GlassCard } from './GlassCard';
import { cn } from '../lib/utils';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse rounded-lg bg-white/[0.08]', className)} />
);

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <GlassCard key={i} className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-40" />
      </GlassCard>
    ))}
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 6 }) => (
  <GlassCard className="p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-9 w-60 rounded-xl" />
    </div>
    <div className="space-y-3 pt-2">
      <div className="flex gap-4 pb-2 border-b border-white/[0.08]">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-2 border-b border-white/[0.04]">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  </GlassCard>
);
