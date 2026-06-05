/**
 * Structured frontend logger.
 *
 * - Only emits output in development (NODE_ENV !== 'production').
 * - Uses grouped, color-coded console output for readability in DevTools.
 * - In production all methods are no-ops, adding zero overhead.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
}

const IS_DEV = process.env.NODE_ENV !== 'production';

const LEVEL_STYLES: Record<LogLevel, string> = {
  debug: 'color: #94a3b8; font-weight: bold',
  info:  'color: #60a5fa; font-weight: bold',
  warn:  'color: #f59e0b; font-weight: bold',
  error: 'color: #f87171; font-weight: bold',
};

const LEVEL_LABELS: Record<LogLevel, string> = {
  debug: 'DEBUG',
  info:  'INFO ',
  warn:  'WARN ',
  error: 'ERROR',
};

function emit(entry: LogEntry): void {
  if (!IS_DEV) return;

  const { level, message, context, data } = entry;
  const prefix = context ? `[${context}]` : '';
  const label = `%c${LEVEL_LABELS[level]}%c ${prefix} ${message}`;
  const baseStyle = LEVEL_STYLES[level];
  const textStyle = 'color: inherit; font-weight: normal';

  if (data !== undefined) {
    console.groupCollapsed(label, baseStyle, textStyle);
    console.log(data);
    console.groupEnd();
  } else {
    console.log(label, baseStyle, textStyle);
  }
}

export const logger = {
  debug: (message: string, data?: unknown, context?: string) =>
    emit({ level: 'debug', message, context, data }),

  info: (message: string, data?: unknown, context?: string) =>
    emit({ level: 'info', message, context, data }),

  warn: (message: string, data?: unknown, context?: string) =>
    emit({ level: 'warn', message, context, data }),

  error: (message: string, err?: unknown, context?: string) => {
    if (!IS_DEV) return;
    const prefix = context ? `[${context}]` : '';
    const label = `%cERROR%c ${prefix} ${message}`;
    console.groupCollapsed(label, LEVEL_STYLES.error, 'color: inherit; font-weight: normal');
    if (err instanceof Error) {
      console.error(err.message);
      if (err.stack) console.log(err.stack);
    } else if (err !== undefined) {
      console.error(err);
    }
    console.groupEnd();
  },
};

/**
 * Creates a logger bound to a specific component/module context.
 * Usage: const log = createLogger('ManageCampaigns');
 *        log.error('save failed', err);
 */
export function createLogger(context: string) {
  return {
    debug: (message: string, data?: unknown) => logger.debug(message, data, context),
    info:  (message: string, data?: unknown) => logger.info(message, data, context),
    warn:  (message: string, data?: unknown) => logger.warn(message, data, context),
    error: (message: string, err?: unknown)  => logger.error(message, err, context),
  };
}
