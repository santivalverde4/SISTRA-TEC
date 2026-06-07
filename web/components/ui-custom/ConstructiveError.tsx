'use client';

import { AlertCircle, Lightbulb } from 'lucide-react';

interface ConstructiveErrorProps {
  error: string;
  suggestion?: string;
  onDismiss?: () => void;
}

/**
 * Componente de error constructivo para GenderMag - Inclusión Cognitiva
 * Muestra errores con sugerencias para resolver el problema
 */
export const ConstructiveError = ({ error, suggestion, onDismiss }: ConstructiveErrorProps) => {
  return (
    <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
      <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-800">{error}</p>
        {suggestion && (
          <div className="flex items-start gap-2 mt-2">
            <Lightbulb size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">{suggestion}</p>
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-red-600 hover:text-red-800 flex-shrink-0"
          aria-label="Cerrar error"
        >
          ×
        </button>
      )}
    </div>
  );
};
