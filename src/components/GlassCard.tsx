import React from 'react';
import { cn } from '../lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'subtle' | 'interactive';
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-[#121212] border border-white/[0.08] shadow-xl shadow-black/40',
    elevated: 'bg-[#161616] border border-white/[0.12] shadow-2xl shadow-black/60',
    subtle: 'bg-[#141414]/70 border border-white/[0.06]',
    interactive: 'bg-[#121212] border border-white/[0.08] shadow-xl hover:border-white/[0.2] hover:bg-[#181818] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
  };

  return (
    <div
      className={cn(
        'rounded-[28px] relative overflow-hidden',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

