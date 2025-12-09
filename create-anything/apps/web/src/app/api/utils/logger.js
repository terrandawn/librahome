/**
 * Server-side Logging Utility for API Routes
 * Provides structured logging for backend operations
 */

// Logging levels with priorities
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Get current log level from environment
const getLogLevel = () => {
  const envLogLevel = process.env.LOG_LEVEL?.toUpperCase();
  if (envLogLevel && LOG_LEVELS[envLogLevel] !== undefined) {
    return LOG_LEVELS[envLogLevel];
  }
  
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (nodeEnv === 'development') return LOG_LEVELS.DEBUG;
  if (nodeEnv === 'test') return LOG_LEVELS.WARN;
  return LOG_LEVELS.INFO;
};

// Format timestamp
const getTimestamp = () => {
  return new Date().toISOString();
};

// Core logging function
const log = (level, message, data = null, context = {}) => {
  const currentLogLevel = getLogLevel();
  
  if (LOG_LEVELS[level] < currentLogLevel) {
    return; // Skip logs below current level
  }

  const timestamp = getTimestamp();
  const logEntry = {
    timestamp,
    level,
    message,
    data,
    context,
    environment: process.env.NODE_ENV || 'development',
    pid: process.pid,
    memory: process.memoryUsage(),
  };

  // Console logging with colors for development
  if (process.env.NODE_ENV === 'development') {
    const colors = {
      DEBUG: '\x1b[90m',  // Gray
      INFO: '\x1b[36m',   // Cyan
      WARN: '\x1b[33m',   // Yellow
      ERROR: '\x1b[31m',  // Red
      RESET: '\x1b[0m',   // Reset
    };

    const color = colors[level] || colors.INFO;
    const prefix = `${color}[${timestamp}] ${level}${colors.RESET} - ${message}`;
    console.log(prefix);
    
    if (data) {
      console.log('Data:', data);
    }
    if (Object.keys(context).length > 0) {
      console.log('Context:', context);
    }
  } else {
    // Production: structured JSON logs
    console.log(JSON.stringify(logEntry));
  }

  // In production, you might want to send logs to a service
  if (process.env.NODE_ENV === 'production' && LOG_LEVELS[level] >= LOG_LEVELS.ERROR) {
    sendToLogService(logEntry);
  }
};

// Send logs to external service
const sendToLogService = async (logEntry) => {
  try {
    // Example: Send to services like Sentry, DataDog, LogRocket, etc.
    // await yourLogService.captureException(logEntry);
  } catch (error) {
    console.warn('Failed to send log to service:', error);
  }
};

// API request logging middleware
export const logApiRequest = (request, startTime = null) => {
  const url = new URL(request.url);
  const method = request.method;
  const userAgent = request.headers.get('user-agent');
  const userId = request.headers.get('x-user-id');
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';

  const context = {
    category: 'api_request',
    method,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams),
    userAgent,
    userId,
    ip,
    duration: startTime ? Date.now() - startTime : null,
  };

  log('INFO', `API ${method} ${url.pathname}`, null, context);
};

// API response logging
export const logApiResponse = (request, status, startTime, error = null) => {
  const url = new URL(request.url);
  const method = request.method;
  const duration = Date.now() - startTime;

  const message = error
    ? `API ${method} ${url.pathname} failed (${status})`
    : `API ${method} ${url.pathname} completed (${status})`;

  const data = {
    method,
    path: url.pathname,
    status,
    duration,
  };
  if (error) data.error = error.message;

  const context = {
    category: 'api_response',
    method,
    path: url.pathname,
    status,
    duration,
    userId: request.headers.get('x-user-id'),
  };

  if (error) {
    log('ERROR', message, data, context);
  } else if (status >= 400) {
    log('WARN', message, data, context);
  } else {
    log('INFO', message, data, context);
  }
};

// Database operation logging
export const logDbOperation = (operation, table, duration, error = null) => {
  const message = error
    ? `DB ${operation} on ${table} failed`
    : `DB ${operation} on ${table} completed`;

  const data = {
    operation,
    table,
    duration,
  };
  if (error) data.error = error.message;

  const context = {
    category: 'database',
    operation,
    table,
    duration,
  };

  if (error) {
    log('ERROR', message, data, context);
  } else {
    log('DEBUG', message, data, context);
  }
};

// Convenience methods
export const serverLogger = {
  debug: (message, data, context) => log('DEBUG', message, data, context),
  info: (message, data, context) => log('INFO', message, data, context),
  warn: (message, data, context) => log('WARN', message, data, context),
  error: (message, error, context) => {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error;
    log('ERROR', message, errorData, context);
  },
};

// Default export
export default serverLogger;