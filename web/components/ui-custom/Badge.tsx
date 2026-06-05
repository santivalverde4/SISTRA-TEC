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

const statusColors: Record<string, string> = {
  OPEN: 'bg-[var(--status-open)] text-white',
  FROZEN: 'bg-[var(--status-frozen)] text-white',
  CLOSED: 'bg-[var(--status-closed)] text-white',
  IN_TRANSIT: 'bg-[var(--status-transit)] text-white',
  DELIVERED: 'bg-[var(--status-delivered)] text-white',
  FINALIZED: 'bg-[var(--status-completed)] text-white',
};

export function StatusBadge({ status }: { status: CampaignStatus | TransportStatus | string }) {
  const { t } = useT();

  const statusLabels: Record<string, string> = {
    OPEN: t('campaign.status_open'),
    FROZEN: t('campaign.status_frozen'),
    CLOSED: t('campaign.status_closed'),
    IN_TRANSIT: t('campaign.status_in_transit'),
    DELIVERED: t('campaign.status_delivered'),
    FINALIZED: t('campaign.status_finalized'),
  };

  const color = statusColors[status] ?? statusColors['OPEN'];
  const label = statusLabels[status] ?? status;

  return (
    <span className={clsx('inline-flex items-center rounded-full px-3 py-1', color)}>
      {label}
    </span>
  );
}
