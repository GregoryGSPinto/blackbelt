import { logger as legacyLogger, type Logger as LegacyLogger } from '@/lib/logger';

export type StructuredLogContext = Record<string, unknown>;

function formatMessage(message: string, context?: StructuredLogContext) {
  if (!context || Object.keys(context).length === 0) {
    return message;
  }

  return `${message} ${JSON.stringify(context)}`;
}

export const logger = {
  info(scope: string, message: string, context?: StructuredLogContext) {
    legacyLogger.info(scope, formatMessage(message, context));
  },
  warn(scope: string, message: string, context?: StructuredLogContext) {
    legacyLogger.warn(scope, formatMessage(message, context));
  },
  error(scope: string, message: string, error?: unknown, context?: StructuredLogContext) {
    legacyLogger.error(scope, formatMessage(message, context), error);
  },
  debug(scope: string, message: string, context?: StructuredLogContext) {
    legacyLogger.debug(scope, formatMessage(message, context));
  },
} as const;

export type Logger = typeof logger | LegacyLogger;
