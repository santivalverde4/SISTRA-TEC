'use client';

import { RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface UndoButtonProps {
  onUndo: () => void;
  disabled?: boolean;
  label?: string;
}

/**
 * Componente de botón deshacer para GenderMag - Inclusión Cognitiva
 * Permite deshacer acciones recientes
 */
export const UndoButton = ({ onUndo, disabled = false, label = 'Deshacer' }: UndoButtonProps) => {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onUndo}
      disabled={disabled}
      className="gap-2"
    >
      <RotateCcw size={16} />
      {label}
    </Button>
  );
};
