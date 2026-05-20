import { clsx } from 'clsx';
import { Check, Clock, Truck, Package, MapPin } from 'lucide-react';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'status' | 'logistic';
  status?: 'completed' | 'current' | 'pending';
}

interface TimelineProps {
  events: TimelineEvent[];
}

const getIcon = (type: string, index: number) => {
  const icons = {
    0: Package,
    1: Truck,
    2: MapPin,
    3: Check,
  };
  return icons[index as keyof typeof icons] || Clock;
};

export const Timeline = ({ events }: TimelineProps) => {
  return (
    <div className="relative">
      {events.map((event, index) => {
        const Icon = getIcon(event.type, index);
        const isLast = index === events.length - 1;
        const isCompleted = event.status === 'completed';
        const isCurrent = event.status === 'current';

        return (
          <div key={event.id} className="relative pb-8">
            {!isLast && (
              <div
                className={clsx(
                  'absolute left-5 top-10 w-0.5 h-full',
                  isCompleted ? 'bg-primary' : 'bg-border'
                )}
              />
            )}

            <div className="flex gap-4">
              <div
                className={clsx(
                  'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary/20 text-primary ring-4 ring-primary/10',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 pt-0.5">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <h4 className={clsx(isCompleted && 'text-foreground', !isCompleted && 'text-muted-foreground')}>
                    {event.title}
                  </h4>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {event.date}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{event.description}</p>

                {event.type === 'logistic' && (
                  <div className="mt-2 inline-flex items-center gap-2 px-2 py-1 rounded bg-accent/50 text-accent-foreground text-xs">
                    Evento Logístico
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
