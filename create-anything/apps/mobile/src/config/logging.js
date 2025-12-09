/**
 * Logging Configuration
 * Centralized logging configuration and setup for the entire app
 */

import { Platform } from 'react-native';
import { logger, actionLogger } from '../utils/logger';
import { bookManager } from '../utils/bookManager';

// Logging configuration
export const LOGGING_CONFIG = {
  // Enable/disable different logging features
  enabled: {
    console: __DEV__, // Enable console logs in development
    storage: true,    // Enable local storage logging
    remote: false,    // Enable remote logging (set to true in production)
    performance: true, // Enable performance logging
    userActions: true, // Enable user action logging
    errors: true,      // Enable error logging
    navigation: true,  // Enable navigation logging
    api: true,         // Enable API call logging
  },

  // Log levels
  levels: {
    console: __DEV__ ? 'DEBUG' : 'ERROR', // Debug in dev, errors only in prod
    storage: 'INFO',   // Store INFO and above in local storage
    remote: 'ERROR',   // Send only errors to remote service
  },

  // Limits and thresholds
  limits: {
    maxLogs: 1000,           // Maximum logs to store locally
    maxDailyLogs: 10000,     // Maximum daily logs
    performanceThreshold: 100, // Performance threshold in ms
    apiTimeoutThreshold: 5000, // API timeout threshold in ms
  },

  // Remote logging configuration
  remote: {
    endpoint: process.env.EXPO_PUBLIC_LOGGING_ENDPOINT || null,
    apiKey: process.env.EXPO_PUBLIC_LOGGING_API_KEY || null,
    batchSize: 10,           // Batch size for remote logging
    flushInterval: 30000,    // Flush interval in ms
  },

  // Sanitization rules
  sanitization: {
    sensitiveFields: [
      'password',
      'token',
      'secret',
      'key',
      'auth',
      'authorization',
      'cookie',
      'session',
    ],
    maxDataSize: 1000, // Max data size in characters before truncation
  },

  // Categories to always log regardless of level
  alwaysLog: [
    'error',
    'authentication',
    'security',
    'critical',
  ],
};

// Initialize logging system
export const initializeLogging = async () => {
  try {
    // Log app startup
    actionLogger.logAppStart(Date.now(), true);
    
    // Log device information
    actionLogger.logDeviceInfo('app_initialized', {
      platform: Platform.OS,
      version: Platform.Version,
      isDev: __DEV__,
      config: LOGGING_CONFIG,
    });

    // Initialize book manager (this will be logged)
    await bookManager.loadBooks();

    // Set up global error handlers
    setupGlobalErrorHandlers();

    // Set up performance monitoring
    if (LOGGING_CONFIG.enabled.performance) {
      setupPerformanceMonitoring();
    }

    logger.info('Logging system initialized', {
      config: LOGGING_CONFIG,
      platform: Platform.OS,
    });

    return true;
  } catch (error) {
    console.error('Failed to initialize logging:', error);
    return false;
  }
};

// Setup global error handlers
const setupGlobalErrorHandlers = () => {
  // Handle unhandled promise rejections
  if (typeof process !== 'undefined' && process.on) {
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Promise Rejection', reason, {
        category: 'unhandled_error',
        promise: promise.toString(),
      });
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', error, {
        category: 'unhandled_error',
        fatal: true,
      });
    });
  }
};

// Setup performance monitoring
const setupPerformanceMonitoring = () => {
  // Monitor app render performance
  let lastRenderTime = Date.now();
  
  const measureRender = () => {
    const now = Date.now();
    const renderTime = now - lastRenderTime;
    lastRenderTime = now;

    if (renderTime > LOGGING_CONFIG.limits.performanceThreshold) {
      actionLogger.logPerformance('render_time', renderTime, 'ms', {
        threshold: LOGGING_CONFIG.limits.performanceThreshold,
      });
    }

    requestAnimationFrame(measureRender);
  };

  requestAnimationFrame(measureRender);
};

// Utility functions for logging
export const logUtils = {
  // Safe JSON stringify with size limits
  safeStringify: (obj, maxSize = LOGGING_CONFIG.sanitization.maxDataSize) => {
    try {
      const str = JSON.stringify(obj);
      return str.length > maxSize ? str.substring(0, maxSize) + '...' : str;
    } catch (error) {
      return `[Object too large to serialize: ${error.message}]`;
    }
  },

  // Sanitize sensitive data
  sanitizeData: (data) => {
    if (!data || typeof data !== 'object') return data;

    const sensitiveFields = LOGGING_CONFIG.sanitization.sensitiveFields;
    const sanitized = {};

    Object.keys(data).forEach(key => {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveFields.some(field => 
        lowerKey.includes(field.toLowerCase())
      );

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        sanitized[key] = logUtils.sanitizeData(data[key]);
      } else {
        sanitized[key] = data[key];
      }
    });

    return sanitized;
  },

  // Get memory usage information
  getMemoryUsage: () => {
    try {
      if (typeof performance !== 'undefined' && performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  // Check if logging should be performed for a given level
  shouldLog: (level, category = null) => {
    // Always log critical categories
    if (category && LOGGING_CONFIG.alwaysLog.includes(category)) {
      return true;
    }

    // Check if logging is enabled for this level
    const levelPriority = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
    const configLevel = LOGGING_CONFIG.levels.console;
    const currentPriority = levelPriority[level];
    const configPriority = levelPriority[configLevel];

    return currentPriority >= configPriority;
  },
};

// Enhanced action logger wrapper with configuration
export const enhancedLogger = {
  // Log with configuration checks
  log: (level, message, data = null, context = {}) => {
    if (!logUtils.shouldLog(level, context.category)) {
      return;
    }

    const sanitizedData = data ? logUtils.sanitizeData(data) : null;
    logger[level.toLowerCase()](message, sanitizedData, context);
  },

  // Performance logging with thresholds
  logPerformance: (metric, value, unit = 'ms', context = {}) => {
    if (!LOGGING_CONFIG.enabled.performance) return;

    const threshold = LOGGING_CONFIG.limits.performanceThreshold;
    const isSlow = unit === 'ms' && value > threshold;

    actionLogger.logPerformance(metric, value, unit, {
      ...context,
      threshold,
      isSlow,
    });

    if (isSlow) {
      actionLogger.warn(`Slow performance detected: ${metric}`, {
        value,
        unit,
        threshold,
        ...context,
      });
    }
  },

  // User action logging with sanitization
  logUserAction: (action, details = {}) => {
    if (!LOGGING_CONFIG.enabled.userActions) return;

    const sanitizedDetails = logUtils.sanitizeData(details);
    actionLogger.userAction(action, sanitizedDetails);
  },

  // API logging with timeout detection
  logApiCall: (method, url, startTime, endTime = null, status = null, error = null) => {
    if (!LOGGING_CONFIG.enabled.api) return;

    const duration = endTime ? endTime - startTime : null;
    const timeoutThreshold = LOGGING_CONFIG.limits.apiTimeoutThreshold;

    if (duration && duration > timeoutThreshold) {
      actionLogger.warn(`Slow API call detected: ${method} ${url}`, {
        duration,
        timeoutThreshold,
        method,
        url,
        status,
      });
    }

    actionLogger.logApiCall(method, url, startTime, endTime, status, error);
  },
};

// Export the main logger and configuration
export default {
  logger,
  actionLogger,
  enhancedLogger,
  config: LOGGING_CONFIG,
  initialize: initializeLogging,
  utils: logUtils,
  bookManager,
};