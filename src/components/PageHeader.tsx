import React from 'react';
import { cn } from '../lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
  breadcrumbs,
  className,
}) => {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6', className)}>
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            {breadcrumbs.map((b, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span>/</span>}
                {b.href ? (
                  <a href={b.href} className="hover:text-indigo-400 transition-colors">
                    {b.label}
                  </a>
                ) : (
                  <span className="text-slate-300 font-medium">{b.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-1 max-w-2xl">{subtitle}</p>}
      </div>

      {action && <div className="flex items-center gap-3 flex-wrap">{action}</div>}
    </div>
  );
};
