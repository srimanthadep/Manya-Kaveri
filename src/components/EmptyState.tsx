import React from 'react';
import { LucideIcon, Hotel } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { cn } from '../lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Hotel,
  title,
  description,
  action,
  className,
}) => {
  return (
    <GlassCard className={cn('p-12 text-center flex flex-col items-center justify-center', className)}>
      <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.1] backdrop-blur-md flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-1.5">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>}
      {action && <div>{action}</div>}
    </GlassCard>
  );
};
