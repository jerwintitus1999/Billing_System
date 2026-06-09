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

// Determine environments
const isProduction = config.env === 'production' || process.env.VERCEL === '1';

// Dynamic Transports Setup
const activeTransports: winston.transport[] = [
  // Clean console output (enabled in all environments)
  new transports.Console({
    format: consoleFormat,
    stderrLevels: ['error'],
    handleExceptions: true,
    handleRejections: true
  })
];

const exceptionHandlers: winston.transport[] = [];
const rejectionHandlers: winston.transport[] = [];

// Only add File transports in local development / non-production environments
if (!isProduction) {
  // Error log file (errors only)
  activeTransports.push(
    new transports.File({
      filename: `${LOGS_DIRECTORY}/error.log`,
      level: 'error',
      maxsize: MAX_FILE_SIZE,
      maxFiles: MAX_FILES,
      format: fileFormat
    })
  );

  // Combined log file (all levels)
  activeTransports.push(
    new transports.File({
      filename: `${LOGS_DIRECTORY}/combined.log`,
      maxsize: MAX_FILE_SIZE,
      maxFiles: MAX_FILES,
      format: fileFormat
    })
  );

  // Exceptions File transport
  exceptionHandlers.push(
    new transports.File({ 
      filename: `${LOGS_DIRECTORY}/exceptions.log`,
      format: fileFormat
    })
  );

  // Rejections File transport
  rejectionHandlers.push(
    new transports.File({ 
      filename: `${LOGS_DIRECTORY}/rejections.log`,
      format: fileFormat
    })
  );
}

// Create the logger instance
const logger: Logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: fileFormat,
  transports: activeTransports,
  exceptionHandlers: exceptionHandlers.length > 0 ? exceptionHandlers : undefined,
  rejectionHandlers: rejectionHandlers.length > 0 ? rejectionHandlers : undefined,
  exitOnError: false
});

// Add debug console logging in non-production environments
if (!isProduction) {
  logger.debug('Logger initialized in development mode with file transports');
} else {
  logger.info('Logger initialized in production mode with console transport only');
}

export default logger;