import React from 'react';
import { LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { cn } from '../lib/utils';

export interface StatCardProps {
  icon?: LucideIcon | React.ReactNode;
  label?: string;
  title?: string;
  value: string | number;
  description?: string;
  subtitle?: string;
  change?: string;
  trend?:
    | {
        value: string;
        isPositive: boolean;
      }
    | 'up'
    | 'down';
  accentColor?: 'indigo' | 'violet' | 'gold' | 'emerald' | 'rose';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: IconOrElement,
  label,
  title,
  value,
  description,
  subtitle,
  change,
  trend,
  accentColor = 'indigo',
  className,
}) => {
  const displayLabel = label || title || '';
  const displayDesc = description || subtitle || '';

  // Resolve Icon or React element
  const renderIcon = () => {
    if (!IconOrElement) return null;
    if (React.isValidElement(IconOrElement)) {
      return IconOrElement;
    }
    const Icon = IconOrElement as LucideIcon;
    return <Icon className="w-5 h-5" />;
  };

  const isTrendPositive =
    typeof trend === 'object' && trend !== null
      ? trend.isPositive
      : trend === 'up' || (change && change.includes('+'));

  const trendText =
    typeof trend === 'object' && trend !== null
      ? trend.value
      : change || '';

  const accentPills = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    gold: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <GlassCard className={cn('p-6 group hover:border-white/20 transition-all duration-300 flex flex-col justify-between', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            {displayLabel}
          </p>
          <h3 className="text-3xl font-bold tracking-tight text-white">{value}</h3>
        </div>
        {IconOrElement && (
          <div className={cn('p-3 rounded-2xl border transition-transform duration-200 group-hover:scale-105 shrink-0', accentPills[accentColor])}>
            {renderIcon()}
          </div>
        )}
      </div>

      {(displayDesc || trendText) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-white/[0.06] text-xs">
          {trendText && (
            <span
              className={cn(
                'inline-flex items-center font-bold px-2 py-0.5 rounded-full text-[11px] border',
                isTrendPositive
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              )}
            >
              {isTrendPositive ? '↑' : '↓'} {trendText}
            </span>
          )}
          {displayDesc && <span className="text-zinc-400 text-[11px]">{displayDesc}</span>}
        </div>
      )}
    </GlassCard>
  );
};

