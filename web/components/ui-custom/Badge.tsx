'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import type { CampaignStatus, TransportStatus } from '@/types';
import { useT } from '@/lib/i18n/useT';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'secondary';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx(
          'inline-flex items-center rounded-full px-2.5 py-0.5',
          {
            'bg-primary/10 text-primary': variant === 'default',
            'bg-[var(--success)]/10 text-[var(--success)]': variant === 'success',
            'bg-[var(--warning)]/10 text-[var(--warning)]': variant === 'warning',
            'bg-destructive/10 text-destructive': variant === 'destructive',
            'bg-[var(--info)]/10 text-[var(--info)]': variant === 'info',
            'bg-secondary text-secondary-foreground': variant === 'secondary',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

const statusBgColors: Record<string, string> = {
  'abierta':   '#10b981',
  'congelada': '#3b82f6',
  'cerrada':   '#f59e0b',
  'en-camino': '#8b5cf6',
  'entregada': '#059669',
  'finalizada':'#64748b',
};

export function StatusBadge({ status }: { status: CampaignStatus | TransportStatus | string }) {
  const { t } = useT();

  const statusLabels: Record<string, string> = {
    'abierta':   t('campaign.status_open'),
    'congelada': t('campaign.status_frozen'),
    'cerrada':   t('campaign.status_closed'),
    'en-camino': t('campaign.status_in_transit'),
    'entregada': t('campaign.status_delivered'),
    'finalizada':t('campaign.status_finalized'),
  };

  const bg = statusBgColors[status] ?? statusBgColors['OPEN'];
  const label = statusLabels[status] ?? status;

  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-white text-sm font-medium"
      style={{ backgroundColor: bg }}
    >
      {label}
    </span>
  );
}
