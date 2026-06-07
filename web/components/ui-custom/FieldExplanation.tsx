'use client';

import { Info } from 'lucide-react';

interface FieldExplanationProps {
  text: string;
  icon?: boolean;
}

/**
 * Componente de explicación de campo para GenderMag - Inclusión Cognitiva
 * Muestra el "por qué" se solicita un campo específico
 */
export const FieldExplanation = ({ text, icon = true }: FieldExplanationProps) => {
  return (
    <div className="flex items-start gap-2 mt-1 p-2 bg-amber-50 border-l-2 border-amber-400 rounded">
      {icon && <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />}
      <p className="text-xs text-amber-800">{text}</p>
    </div>
  );
};
