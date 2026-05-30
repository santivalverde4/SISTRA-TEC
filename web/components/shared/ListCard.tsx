'use client';

import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui-custom/Card';
import { Button } from '@/components/ui-custom/Button';

interface ListCardProps {
  icon: ReactNode;
  title: string;
  badge?: ReactNode;
  meta?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function ListCard({ icon, title, badge, meta, action }: ListCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent>
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="truncate">{title}</h4>
              {action && (
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              )}
            </div>
            {badge && <div className="mt-1">{badge}</div>}
            {meta && (
              <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                {meta}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
