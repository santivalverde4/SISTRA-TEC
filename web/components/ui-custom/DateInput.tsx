'use client';

import { forwardRef } from 'react';

interface DateInputProps {
  value: string; // yyyy-mm-dd (ISO)
  onChange: (isoValue: string) => void;
  min?: string; // yyyy-mm-dd
  max?: string; // yyyy-mm-dd
  error?: string;
  className?: string;
}

/**
 * Date input that shows the native calendar picker using the machine's locale.
 * Stores and emits ISO format (yyyy-mm-dd) internally.
 */
export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onChange, min, max, error, className = '' }, ref) => {
    return (
      <div>
        <input
          ref={ref}
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          style={{ colorScheme: 'auto' }}
          className={`w-full px-3 py-2 bg-input border border-input rounded-lg text-foreground
            focus:outline-none focus:ring-2 focus:ring-ring
            [&::-webkit-calendar-picker-indicator]:opacity-60
            [&::-webkit-calendar-picker-indicator]:cursor-pointer
            ${error ? 'border-destructive' : ''}
            ${className}`}
        />
        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';
