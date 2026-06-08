import winston, { Logger, format, transports } from 'winston';
import config from '../config/env';
import { TransformableInfo } from 'logform';

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;
const LOGS_DIRECTORY = 'logs';

// Custom format for errors
const enumerateErrorFormat = format((info: TransformableInfo) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

// Common format for all transports
const commonFormats = [
  enumerateErrorFormat(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.splat(),
];

// Clean terminal output format
const consoleFormat = format.combine(
  format.colorize(),
  format.printf(({ level, message }) => {
    // Simplify connection success messages
    if (typeof message === 'string' && message.match(/connected|success/gi)) {
      return message;
    }
    return `${level}: ${message}`;
  })
);

// Detailed file format
const fileFormat = format.combine(
  ...commonFormats,
  format.uncolorize(),
  format.json()
);

// Create the logger instance
const logger: Logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  // Default format (used when no specific format is provided to transport)
  format: fileFormat,
  transports: [
    // Clean console output
    new transports.Console({
      format: consoleFormat,
      stderrLevels: ['error'],
      handleExceptions: true,
      handleRejections: true
    }),

    // Error log file (errors only)
    new transports.File({
      filename: `${LOGS_DIRECTORY}/error.log`,
      level: 'error',
      maxsize: MAX_FILE_SIZE,
      maxFiles: MAX_FILES,
      format: fileFormat
    }),

    // Combined log file (all levels)
    new transports.File({
      filename: `${LOGS_DIRECTORY}/combined.log`,
      maxsize: MAX_FILE_SIZE,
      maxFiles: MAX_FILES,
      format: fileFormat
    })
  ],
  exceptionHandlers: [
    new transports.File({ 
      filename: `${LOGS_DIRECTORY}/exceptions.log`,
      format: fileFormat
    })
  ],
  rejectionHandlers: [
    new transports.File({ 
      filename: `${LOGS_DIRECTORY}/rejections.log`,
      format: fileFormat
    })
  ],
  exitOnError: false
});

// Add debug console logging in non-production environments
if (config.env !== 'production') {
  logger.debug('Logger initialized in development mode');
}

export default logger;