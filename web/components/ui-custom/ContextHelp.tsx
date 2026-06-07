'use client';

import { HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface ContextHelpProps {
  text: string;
  title?: string;
  children?: React.ReactNode;
}

/**
 * Componente de ayuda contextual para GenderMag - Inclusión Cognitiva
 * Muestra un icono de ayuda que despliega información sobre campos difíciles
 */
export const ContextHelp = ({ text, title, children }: ContextHelpProps) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setShowHelp(!showHelp)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors ml-2"
        aria-label={`Help: ${title || text}`}
        title={title || text}
      >
        <HelpCircle size={16} />
      </button>

      {showHelp && (
        <div className="absolute z-50 p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-lg max-w-xs left-0 mt-2 text-sm text-gray-700">
          {title && <p className="font-semibold text-blue-900 mb-1">{title}</p>}
          <p className="text-blue-800">{text}</p>
          {children}
          <button
            type="button"
            onClick={() => setShowHelp(false)}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
};
