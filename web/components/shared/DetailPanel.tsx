'use client';

import { ReactNode } from 'react';

interface DetailHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}

interface DetailFieldProps {
  label: string;
  value: ReactNode;
}

interface DetailGridProps {
  children: ReactNode;
  cols?: 1 | 2;
}

export function DetailHeader({ icon, title, subtitle }: DetailHeaderProps) {
  return (
    <div className="flex items-center gap-4 pb-4 border-b border-border">
      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="truncate">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export function DetailGrid({ children, cols = 2 }: DetailGridProps) {
  return (
    <div className={`grid gap-4 ${cols === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
      {children}
    </div>
  );
}

export function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
