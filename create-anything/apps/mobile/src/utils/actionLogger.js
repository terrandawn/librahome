/**
 * Enhanced Action Logger for Comprehensive Activity Tracking
 * This logger wraps the base logger and ensures all user actions are properly logged
 */

import { logger } from './logger';

// Action categories for better organization
const ACTION_CATEGORIES = {
  USER_INTERACTION: 'user_interaction',
  NAVIGATION: 'navigation',
  API_CALL: 'api_call',
  AUTHENTICATION: 'authentication',
  DEVICE: 'device',
  PERFORMANCE: 'performance',
  ERROR: 'error',
  BOOK_MANAGEMENT: 'book_management',
  UPLOAD: 'upload',
  SEARCH: 'search',
  SETTINGS: 'settings',
};

// Action logger that ensures all important actions are logged
export const actionLogger = {
  // User interaction logging
  logClick: (element, screen, additionalData = {}) => {
    logger.userAction('click', {
      element,
      screen,
      ...additionalData
    });
  },

  logFormSubmit: (formName, formData, screen) => {
    logger.userAction('form_submit', {
      formName,
      formData: sanitizeFormData(formData),
      screen
    });
  },

  logScreenView: (screenName, params = {}) => {
    logger.navigation('previous', screenName, params);
    logger.info(`Screen viewed: ${screenName}`, params, {
      category: ACTION_CATEGORIES.USER_INTERACTION,
      action: 'screen_view'
    });
  },

  // Navigation logging
  logNavigation: (from, to, method = 'push', params = {}) => {
    logger.navigation(from, to, { method, ...params });
  },

  // Authentication logging
  logAuthAttempt: (action, provider, userId = null, success = null) => {
    logger.auth(action, userId, {
      provider,
      success,
      timestamp: new Date().toISOString()
    });
  },

  logAuthSuccess: (action, userId, provider) => {
    logger.auth(`${action}_success`, userId, { provider });
  },

  logAuthFailure: (action, error, provider) => {
    logger.auth(`${action}_failure`, null, { 
      provider, 
      error: error.message || error 
    });
  },

  // API call logging
  logApiCall: (method, url, startTime, endTime = null, status = null, error = null) => {
    const duration = endTime ? endTime - startTime : null;
    logger.apiCall(method, url, status || 'pending', duration, error);
  },

  logApiSuccess: (method, url, startTime, endTime, response) => {
    const duration = endTime - startTime;
    logger.apiCall(method, url, 'success', duration, null);
    logger.info(`API Success: ${method} ${url}`, {
      responseSize: JSON.stringify(response).length,
      duration
    }, { category: ACTION_CATEGORIES.API_CALL });
  },

  logApiError: (method, url, startTime, endTime, error) => {
    const duration = endTime - startTime;
    logger.apiCall(method, url, 'error', duration, error);
    logger.error(`API Error: ${method} ${url}`, error, {
      category: ACTION_CATEGORIES.API_CALL,
      method,
      url,
      duration
    });
  },

  // Book management logging
  logBookAction: (action, bookId, bookTitle = null, additionalData = {}) => {
    logger.userAction(`book_${action}`, {
      bookId,
      bookTitle,
      ...additionalData
    }, { category: ACTION_CATEGORIES.BOOK_MANAGEMENT });
  },

  logBookSearch: (query, resultsCount, filters = {}) => {
    logger.userAction('book_search', {
      query,
      resultsCount,
      filters
    }, { category: ACTION_CATEGORIES.SEARCH });
  },

  // Upload logging
  logUploadStart: (fileType, fileName, fileSize) => {
    logger.userAction('upload_start', {
      fileType,
      fileName,
      fileSize
    }, { category: ACTION_CATEGORIES.UPLOAD });
  },

  logUploadSuccess: (fileType, fileName, url, duration) => {
    logger.userAction('upload_success', {
      fileType,
      fileName,
      url,
      duration
    }, { category: ACTION_CATEGORIES.UPLOAD });
  },

  logUploadError: (fileType, fileName, error) => {
    logger.userAction('upload_error', {
      fileType,
      fileName,
      error: error.message || error
    }, { category: ACTION_CATEGORIES.UPLOAD });
  },

  // Performance logging
  logPerformance: (metric, value, unit = 'ms', context = {}) => {
    logger.performance(metric, value, unit);
    logger.info(`Performance metric: ${metric}`, {
      value,
      unit,
      ...context
    }, { category: ACTION_CATEGORIES.PERFORMANCE });
  },

  // Error logging
  logError: (error, context = {}) => {
    logger.error('Application error', error, {
      category: ACTION_CATEGORIES.ERROR,
      ...context
    });
  },

  logErrorBoundary: (error, errorInfo, componentStack) => {
    logger.error('Error boundary caught error', error, {
      category: ACTION_CATEGORIES.ERROR,
      errorInfo,
      componentStack,
      type: 'error_boundary'
    });
  },

  // Device/system logging
  logDeviceInfo: (action, deviceInfo) => {
    logger.device(action, deviceInfo);
  },

  // Settings logging
  logSettingChange: (setting, oldValue, newValue, screen) => {
    logger.userAction('setting_change', {
      setting,
      oldValue,
      newValue,
      screen
    }, { category: ACTION_CATEGORIES.SETTINGS });
  },

  // App lifecycle logging
  logAppStart: (startTime, coldStart = true) => {
    logger.info('App started', {
      startTime,
      coldStart,
      timestamp: new Date().toISOString()
    }, { category: ACTION_CATEGORIES.DEVICE, action: 'app_start' });
  },

  logAppBackground: () => {
    logger.info('App moved to background', {}, {
      category: ACTION_CATEGORIES.DEVICE,
      action: 'app_background'
    });
  },

  logAppForeground: () => {
    logger.info('App moved to foreground', {}, {
      category: ACTION_CATEGORIES.DEVICE,
      action: 'app_foreground'
    });
  },

  // Session logging
  logSessionStart: (userId = null) => {
    logger.info('Session started', {
      userId,
      timestamp: new Date().toISOString()
    }, { category: ACTION_CATEGORIES.AUTHENTICATION, action: 'session_start' });
  },

  logSessionEnd: (userId = null, sessionDuration) => {
    logger.info('Session ended', {
      userId,
      sessionDuration,
      timestamp: new Date().toISOString()
    }, { category: ACTION_CATEGORIES.AUTHENTICATION, action: 'session_end' });
  },
};

// Helper function to sanitize form data for logging
const sanitizeFormData = (formData) => {
  if (!formData || typeof formData !== 'object') return {};
  
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
  const sanitized = {};
  
  Object.keys(formData).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = formData[key];
    }
  });
  
  return sanitized;
};

// React Hook for automatic action logging
import { useEffect, useRef } from 'react';
export const useActionLogger = (screenName) => {
  const mountTime = useRef(Date.now());

  useEffect(() => {
    actionLogger.logScreenView(screenName);
    
    return () => {
      const duration = Date.now() - mountTime.current;
      actionLogger.logPerformance('screen_duration', duration, 'ms', {
        screenName
      });
    };
  }, [screenName]);

  return {
    logClick: (element, data) => actionLogger.logClick(element, screenName, data),
    logFormSubmit: (formName, data) => actionLogger.logFormSubmit(formName, data, screenName),
    logNavigation: (to, method) => actionLogger.logNavigation(screenName, to, method),
  };
};

export default actionLogger;