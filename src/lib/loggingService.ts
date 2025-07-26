// import { createLogger, format, Logger, LoggerOptions, transports } from 'winston';

// export interface LoggingService {
//   /**
//    * Logger instance for logging messages.
//    */
//   logger: Logger;
// }

// const logFormat = format.combine(
//   format.timestamp(),
//   format.printf((info) => {
//     const { timestamp, level, message, source } = info;
//     return `${timestamp} [${level}]: ${message}${source ? ` (source: ${source})` : ''}`;
//   })
// );

// const exceptionHandling = {
//   handleExceptions: true,
//   exceptionHandlers: [
//     new transports.Console(),
//     // Add other exception handlers (e.g., file, HTTP) as needed
//   ],
// }

// const rejectionHandling = {
//   handleRejections: true,
//   rejectionHandlers: [
//     new transports.Console(),
//     // Add other rejection handlers (e.g., file, HTTP) as needed
//   ],
// }

// const defaultMeta = { 
//   // Default metadata for all log entries
//   environment: process.env.NODE_ENV || 'development',
//   version: process.env.npm_package_version || 'unknown',
//   // Add any other default metadata you want to include
//   application: 'Kortex',
//   service: 'kortexLoggingService',
// }

// const loggerOptions: LoggerOptions = {
//   defaultMeta,
//   // Enable exit on error
//   exitOnError: false,
//   // Default log level
//   level: 'info',
//   // Define log levels and their corresponding numeric values
//   levels: {
//     error: 0,
//     warn: 1,
//     info: 2,
//     verbose: 3,
//     notice: 4,
//     debug: 5,
//     critical: 6,
//   },
//   // Define the format for log messages
//   format: logFormat,
//   transports: [
//     new transports.Console(),
//     // Add other transports (e.g., file, HTTP) as needed
//   ],
  

//   ...exceptionHandling,
//   ...rejectionHandling
// } as LoggerOptions;

// const logger: Logger = createLogger(loggerOptions) as Logger;

// export const loggingService: LoggingService = {
//   logger: logger,
// };
