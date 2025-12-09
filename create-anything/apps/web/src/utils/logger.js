/**
 * Comprehensive Logging Utility for Web App
 * Provides structured logging with different levels and environments
 */

// Logging levels with priorities
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Current environment and log level
const getEnvironment = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' ? 'development' : 'production';
  }
  return process.env.NODE_ENV || 'development';
};

const getLogLevel = () => {
  const env = getEnvironment();
  if (env === 'development') return LOG_LEVELS.DEBUG;
  if (env === 'test') return LOG_LEVELS.WARN;
  return LOG_LEVELS.INFO;
};

// Format timestamp
const getTimestamp = () => {
  return new Date().toISOString();
};

// Color codes for different log levels (development only)
const COLORS = {
  DEBUG: '#718096', // gray-500
  INFO: '#3182ce',  // blue-500
  WARN: '#d69e2e',  // yellow-500
  ERROR: '#e53e3e', // red-500
};

// Core logging function
const log = (level, message, data = null, context = {}) => {
  const currentLogLevel = getLogLevel();
  
  if (LOG_LEVELS[level] < currentLogLevel && getEnvironment() !== 'development') {
    return; // Skip logs below current level in non-development
  }

  const timestamp = getTimestamp();
  const env = getEnvironment();
  const logEntry = {
    timestamp,
    level,
    message,
    data,
    context,
    environment: env,
    url: typeof window !== 'undefined' ? window.location.href : null,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
  };

  // Development: pretty console logs
  if (env === 'development') {
    const color = COLORS[level];
    const prefix = `%c[${timestamp}] %c${level} %c- %c${message}`;
    const styles = [
      'color: #718096; font-weight: normal',
      `color: ${color}; font-weight: bold; text-transform: uppercase`,
      'color: inherit',
      'color: inherit; font-weight: 500',
    ];
    
    console.log(prefix, ...styles);
    
    if (data) {
      console.log('Data:', data);
    }
    if (Object.keys(context).length > 0) {
      console.log('Context:', context);
    }
  } else {
    // Production: structured logs for potential log aggregation
    console.log(JSON.stringify(logEntry));
  }

  // In production, you might want to send logs to a service
  if (env === 'production' && LOG_LEVELS[level] >= LOG_LEVELS.ERROR) {
    sendToLogService(logEntry);
  }
};

// Send logs to external service (placeholder for services like Sentry, LogRocket, etc.)
const sendToLogService = async (logEntry) => {
  try {
    // Example: Send to your logging endpoint
    // await fetch('/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(logEntry)
    // });
  } catch (error) {
    // Fail silently to avoid infinite loops
    console.warn('Failed to send log to service:', error);
  }
};

// Convenience methods
export const logger = {
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
  
  // Specialized logging methods
  userAction: (action, details = {}) => {
    logger.info(`User action: ${action}`, details, { category: 'user_interaction' });
  },
  
  apiCall: (method, url, status, duration = null, error = null) => {
    const message = error 
      ? `API ${method} ${url} failed (${status})`
      : `API ${method} ${url} completed (${status})`;
    
    const data = { method, url, status, duration };
    if (error) data.error = error;
    
    if (error) {
      logger.error(message, error, { category: 'api_call' });
    } else {
      logger.info(message, data, { category: 'api_call' });
    }
  },
  
  performance: (metric, value, unit = 'ms') => {
    logger.info(`Performance: ${metric}`, { value, unit }, { category: 'performance' });
  },
  
  auth: (action, userId = null, details = {}) => {
    logger.info(`Auth: ${action}`, { userId, ...details }, { category: 'authentication' });
  },
};

// Default export
export default logger;