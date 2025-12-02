/**
 * Comprehensive Logging Utility for Mobile App (React Native)
 * Provides structured logging with different levels and environments
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Logging levels with priorities
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Get current environment
const getEnvironment = () => {
  // In development builds, you might want to use __DEV__
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return 'development';
  }
  return 'production';
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

// Storage key for logs
const LOG_STORAGE_KEY = '@app_logs';

// Maximum number of logs to store locally
const MAX_LOGS = 1000;

// Core logging function
const log = async (level, message, data = null, context = {}) => {
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
    platform: Platform.OS,
    platformVersion: Platform.Version,
    appVersion: '1.0.0', // You should get this from app.json or expo-constants
    id: `${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
  };

  // Development: console logs
  if (env === 'development') {
    const prefix = `[${timestamp}] ${level} - ${message}`;
    console.log(prefix);
    
    if (data) {
      console.log('Data:', data);
    }
    if (Object.keys(context).length > 0) {
      console.log('Context:', context);
    }
  } else {
    // Production: structured logs
    console.log(JSON.stringify(logEntry));
  }

  // Store logs locally (useful for debugging in production)
  await storeLogLocally(logEntry);

  // In production, send critical logs to external service
  if (env === 'production' && LOG_LEVELS[level] >= LOG_LEVELS.ERROR) {
    sendToLogService(logEntry);
  }
};

// Store logs locally in AsyncStorage
const storeLogLocally = async (logEntry) => {
  try {
    const existingLogs = await AsyncStorage.getItem(LOG_STORAGE_KEY);
    const logs = existingLogs ? JSON.parse(existingLogs) : [];
    
    // Add new log
    logs.push(logEntry);
    
    // Keep only the most recent logs
    if (logs.length > MAX_LOGS) {
      logs.splice(0, logs.length - MAX_LOGS);
    }
    
    await AsyncStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
  } catch (error) {
    console.warn('Failed to store log locally:', error);
  }
};

// Get stored logs
export const getStoredLogs = async (limit = 100) => {
  try {
    const existingLogs = await AsyncStorage.getItem(LOG_STORAGE_KEY);
    const logs = existingLogs ? JSON.parse(existingLogs) : [];
    return logs.slice(-limit); // Return most recent logs
  } catch (error) {
    console.warn('Failed to retrieve stored logs:', error);
    return [];
  }
};

// Clear stored logs
export const clearStoredLogs = async () => {
  try {
    await AsyncStorage.removeItem(LOG_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear stored logs:', error);
  }
};

// Send logs to external service
const sendToLogService = async (logEntry) => {
  try {
    // Example: Send to your logging endpoint
    // This could be implemented with fetch or a dedicated logging SDK
    // const response = await fetch('https://your-api.com/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(logEntry)
    // });
    
    // For now, we'll just store locally
    console.log('Would send to log service:', logEntry);
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
    log('INFO', `User action: ${action}`, details, { category: 'user_interaction' });
  },
  
  navigation: (from, to, params = {}) => {
    log('INFO', `Navigation: ${from} → ${to}`, params, { category: 'navigation' });
  },
  
  apiCall: (method, url, status, duration = null, error = null) => {
    const message = error 
      ? `API ${method} ${url} failed (${status})`
      : `API ${method} ${url} completed (${status})`;
    
    const data = { method, url, status, duration };
    if (error) data.error = error;
    
    if (error) {
      log('ERROR', message, error, { category: 'api_call' });
    } else {
      log('INFO', message, data, { category: 'api_call' });
    }
  },
  
  performance: (metric, value, unit = 'ms') => {
    log('INFO', `Performance: ${metric}`, { value, unit }, { category: 'performance' });
  },
  
  auth: (action, userId = null, details = {}) => {
    log('INFO', `Auth: ${action}`, { userId, ...details }, { category: 'authentication' });
  },
  
  device: (action, details = {}) => {
    log('INFO', `Device: ${action}`, details, { 
      category: 'device',
      platform: Platform.OS,
      version: Platform.Version
    });
  },
};

// Export additional utilities
export { getStoredLogs, clearStoredLogs };

// Default export
export default logger;