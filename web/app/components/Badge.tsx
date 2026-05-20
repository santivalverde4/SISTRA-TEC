import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

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

export const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, { label: string; color: string }> = {
    abierta: { label: 'Abierta', color: 'bg-[var(--status-open)] text-white' },
    congelada: { label: 'Congelada', color: 'bg-[var(--status-frozen)] text-white' },
    cerrada: { label: 'Cerrada para donaciones', color: 'bg-[var(--status-closed)] text-white' },
    'en-camino': { label: 'En camino a ser entregada', color: 'bg-[var(--status-transit)] text-white' },
    entregada: { label: 'Entregada', color: 'bg-[var(--status-delivered)] text-white' },
    finalizada: { label: 'Finalizada', color: 'bg-[var(--status-completed)] text-white' },
  };

  const config = variants[status] || variants['abierta'];

  return (
    <span className={clsx('inline-flex items-center rounded-full px-3 py-1', config.color)}>
      {config.label}
    </span>
  );
};
