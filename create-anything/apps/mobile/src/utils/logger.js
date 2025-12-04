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
    
    // Also write to daily log file for comprehensive logging
    await writeToDailyLog(logEntry);
  } catch (error) {
    console.warn('Failed to store log locally:', error);
  }
};

// Write to daily log file for comprehensive tracking
const writeToDailyLog = async (logEntry) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dailyLogKey = `@app_logs_daily_${today}`;
    
    const existingDailyLogs = await AsyncStorage.getItem(dailyLogKey);
    const dailyLogs = existingDailyLogs ? JSON.parse(existingDailyLogs) : [];
    
    dailyLogs.push(logEntry);
    
    // Keep last 7 days of logs
    await AsyncStorage.setItem(dailyLogKey, JSON.stringify(dailyLogs));
    
    // Clean up old daily logs (older than 7 days)
    await cleanupOldDailyLogs();
  } catch (error) {
    console.warn('Failed to write to daily log:', error);
  }
};

// Clean up old daily logs
const cleanupOldDailyLogs = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const dailyLogKeys = keys.filter(key => key.startsWith('@app_logs_daily_'));
    
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    for (const key of dailyLogKeys) {
      const dateStr = key.replace('@app_logs_daily_', '');
      const logDate = new Date(dateStr);
      
      if (logDate < sevenDaysAgo) {
        await AsyncStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.warn('Failed to cleanup old daily logs:', error);
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

// Get daily logs for a specific date range
export const getDailyLogs = async (startDate = null, endDate = null) => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const dailyLogKeys = keys.filter(key => key.startsWith('@app_logs_daily_'));
    
    const allLogs = [];
    
    for (const key of dailyLogKeys) {
      const dateStr = key.replace('@app_logs_daily_', '');
      const logDate = new Date(dateStr);
      
      // Filter by date range if provided
      if (startDate && logDate < startDate) continue;
      if (endDate && logDate > endDate) continue;
      
      const dailyLogs = await AsyncStorage.getItem(key);
      if (dailyLogs) {
        const logs = JSON.parse(dailyLogs);
        allLogs.push(...logs);
      }
    }
    
    // Sort by timestamp
    return allLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  } catch (error) {
    console.warn('Failed to retrieve daily logs:', error);
    return [];
  }
};

// Get logs in different formats
export const getLogsAsText = async (startDate = null, endDate = null) => {
  const logs = await getDailyLogs(startDate, endDate);
  return logs.map(log => {
    const timestamp = new Date(log.timestamp).toLocaleString();
    return `[${timestamp}] ${log.level} - ${log.message}${
      log.data ? `\nData: ${JSON.stringify(log.data, null, 2)}` : ''
    }${
      log.context && Object.keys(log.context).length > 0 
        ? `\nContext: ${JSON.stringify(log.context, null, 2)}` 
        : ''
    }`;
  }).join('\n\n---\n\n');
};

export const getLogsAsCSV = async (startDate = null, endDate = null) => {
  const logs = await getDailyLogs(startDate, endDate);
  const headers = ['timestamp', 'level', 'message', 'data', 'context', 'environment', 'platform'];
  
  const csvContent = [
    headers.join(','),
    ...logs.map(log => [
      `"${log.timestamp}"`,
      `"${log.level}"`,
      `"${log.message.replace(/"/g, '""')}"`,
      `"${JSON.stringify(log.data || {}).replace(/"/g, '""')}"`,
      `"${JSON.stringify(log.context || {}).replace(/"/g, '""')}"`,
      `"${log.environment}"`,
      `"${log.platform}"`
    ].join(','))
  ].join('\n');
  
  return csvContent;
};

export const getLogsAsJSON = async (startDate = null, endDate = null) => {
  const logs = await getDailyLogs(startDate, endDate);
  return JSON.stringify({
    metadata: {
      exportDate: new Date().toISOString(),
      startDate: startDate?.toISOString() || null,
      endDate: endDate?.toISOString() || null,
      totalLogs: logs.length
    },
    logs
  }, null, 2);
};

// Export logs to file (in web environment)
export const exportLogsToFile = async (format = 'json', startDate = null, endDate = null) => {
  let content;
  let filename;
  let mimeType;
  
  const today = new Date().toISOString().split('T')[0];
  
  switch (format.toLowerCase()) {
    case 'text':
    case 'txt':
      content = await getLogsAsText(startDate, endDate);
      filename = `app_logs_${today}.txt`;
      mimeType = 'text/plain';
      break;
    case 'csv':
      content = await getLogsAsCSV(startDate, endDate);
      filename = `app_logs_${today}.csv`;
      mimeType = 'text/csv';
      break;
    case 'json':
    default:
      content = await getLogsAsJSON(startDate, endDate);
      filename = `app_logs_${today}.json`;
      mimeType = 'application/json';
      break;
  }
  
  // In React Native, we'd need to use FileSystem or Share API
  // For now, return the content for the app to handle
  return {
    content,
    filename,
    mimeType
  };
};

// Clear stored logs
export const clearStoredLogs = async () => {
  try {
    await AsyncStorage.removeItem(LOG_STORAGE_KEY);
    
    // Also clear all daily logs
    const keys = await AsyncStorage.getAllKeys();
    const dailyLogKeys = keys.filter(key => key.startsWith('@app_logs_daily_'));
    
    for (const key of dailyLogKeys) {
      await AsyncStorage.removeItem(key);
    }
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