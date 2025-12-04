# Comprehensive Logging Guide

This guide explains how to use the enhanced logging system implemented in the Book Library app.

## Overview

The logging system provides comprehensive tracking of all user actions, errors, performance metrics, and system events. It includes:

- **Action Logging**: Track all user interactions
- **Error Logging**: Comprehensive error catching and reporting
- **Performance Monitoring**: Track app performance metrics
- **API Logging**: Monitor all API calls and responses
- **Book Management Logging**: Track all book-related operations
- **Export Capabilities**: Export logs in multiple formats

## Quick Start

### 1. Initialize Logging

```javascript
import { initializeLogging } from '../config/logging';

// In your app's entry point (e.g., App.js or index.js)
const initializeApp = async () => {
  await initializeLogging();
  // Rest of your app initialization
};
```

### 2. Basic Usage

```javascript
import { enhancedLogger } from '../config/logging';

// Log user actions
enhancedLogger.logUserAction('button_click', {
  button: 'add_book',
  screen: 'library'
});

// Log performance
enhancedLogger.logPerformance('screen_load', 150, 'ms', {
  screen: 'book_details'
});

// Log errors
enhancedLogger.log('ERROR', 'Failed to load books', error, {
  category: 'book_management'
});
```

## Detailed Usage Examples

### Book Management

```javascript
import { bookManager } from '../utils/bookManager';

// Add a book
try {
  const newBook = await bookManager.addBook({
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0-7432-7356-5',
    genre: 'Fiction'
  });
  console.log('Book added:', newBook);
} catch (error) {
  console.error('Failed to add book:', error);
}

// Search books
const results = bookManager.searchBooks('gatsby', {
  genre: 'Fiction'
});

// Update reading progress
await bookManager.updateReadingProgress('book_123', 75);
```

### API Calls with Logging

```javascript
import { enhancedLogger } from '../config/logging';

const fetchBooks = async () => {
  const startTime = Date.now();
  try {
    const response = await fetch('/api/books');
    const endTime = Date.now();
    
    enhancedLogger.logApiCall('GET', '/api/books', startTime, endTime, response.status);
    
    return response.json();
  } catch (error) {
    const endTime = Date.now();
    enhancedLogger.logApiCall('GET', '/api/books', startTime, endTime, null, error);
    throw error;
  }
};
```

### User Interface Components

```javascript
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useActionLogger } from '../utils/actionLogger';

const BookButton = ({ book, onPress }) => {
  const { logClick } = useActionLogger('BookList');

  const handlePress = () => {
    logClick('book_item', { bookId: book.id, bookTitle: book.title });
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      {/* Button content */}
    </TouchableOpacity>
  );
};
```

### Error Boundaries

```javascript
import EnhancedErrorBoundary from '../components/EnhancedErrorBoundary';

const App = () => {
  return (
    <EnhancedErrorBoundary
      showDetails={__DEV__}
      allowReport={true}
      onRestart={() => console.log('Restarting app...')}
      onErrorReport={(error, errorInfo) => {
        // Send error report to your service
        sendErrorReport(error, errorInfo);
      }}
    >
      <YourAppComponents />
    </EnhancedErrorBoundary>
  );
};
```

## Log Categories

The logging system organizes logs into different categories:

- `user_interaction`: User actions like clicks, form submissions
- `navigation`: Screen navigation and routing
- `api_call`: HTTP requests and responses
- `authentication`: Login, logout, auth state changes
- `book_management`: Book CRUD operations
- `upload`: File upload operations
- `performance`: Performance metrics
- `error`: Application errors and exceptions
- `device`: Device and system information

## Log Levels

- `DEBUG`: Detailed information for debugging (development only)
- `INFO`: General information about app operation
- `WARN`: Warning messages for potentially problematic situations
- `ERROR`: Error messages for failures and exceptions

## Configuration

The logging system can be configured in `src/config/logging.js`:

```javascript
export const LOGGING_CONFIG = {
  enabled: {
    console: __DEV__,      // Console logs in development
    storage: true,         // Local storage logging
    remote: false,         // Remote logging service
    performance: true,     // Performance monitoring
    userActions: true,     // User action logging
    errors: true,          // Error logging
    navigation: true,      // Navigation logging
    api: true,            // API logging
  },
  limits: {
    maxLogs: 1000,               // Maximum stored logs
    performanceThreshold: 100,    // Performance threshold (ms)
    apiTimeoutThreshold: 5000,    // API timeout threshold (ms)
  }
};
```

## Viewing Logs

### Log Viewer Component

```javascript
import LogViewer from '../components/LogViewer';
import React, { useState } from 'react';

const App = () => {
  const [showLogs, setShowLogs] = useState(false);

  return (
    <>
      {/* Your app content */}
      
      {/* Log viewer modal */}
      <LogViewer
        visible={showLogs}
        onClose={() => setShowLogs(false)}
      />
    </>
  );
};
```

### Exporting Logs

The LogViewer supports exporting logs in three formats:

1. **JSON**: Structured data for analysis
2. **Text**: Human-readable format
3. **CSV**: For spreadsheet analysis

### Programmatic Log Access

```javascript
import { getStoredLogs, getLogsAsJSON, exportLogsToFile } from '../utils/logger';

// Get recent logs
const recentLogs = await getStoredLogs(100);

// Export logs to file
const exportData = await exportLogsToFile('json');
console.log('Exported data:', exportData.content);
```

## Best Practices

### 1. Use Specific Categories

Always provide a specific category for better log organization:

```javascript
// Good
enhancedLogger.log('INFO', 'Book added', bookData, {
  category: 'book_management',
  action: 'add_book'
});

// Avoid
enhancedLogger.log('INFO', 'Something happened');
```

### 2. Include Context

Provide relevant context for better debugging:

```javascript
enhancedLogger.log('ERROR', 'API call failed', error, {
  category: 'api_call',
  endpoint: '/api/books',
  method: 'POST',
  requestId: 'req_123',
  userId: 'user_456'
});
```

### 3. Sanitize Sensitive Data

The system automatically sanitizes sensitive fields, but be mindful:

```javascript
// The system will automatically redact these
const userData = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'secret123',  // Will be redacted
  token: 'abc123'         // Will be redacted
};
```

### 4. Performance Logging

Use performance logging for critical operations:

```javascript
const startTime = Date.now();
await performExpensiveOperation();
enhancedLogger.logPerformance('expensive_operation', Date.now() - startTime);
```

### 5. Error Handling

Always log errors with proper context:

```javascript
try {
  await riskyOperation();
} catch (error) {
  enhancedLogger.log('ERROR', 'Operation failed', error, {
    category: 'business_logic',
    operation: 'riskyOperation',
    userId: getCurrentUser().id
  });
  
  // Handle the error appropriately
  showErrorToUser(error.message);
}
```

## Debugging Tips

### 1. Use the Log Viewer

Access the LogViewer in development to see real-time logs:
```javascript
// Add this to your dev menu
if (__DEV__) {
  // Show log viewer button in dev mode
}
```

### 2. Filter Logs

Use the filtering capabilities to focus on specific issues:
- Filter by log level (ERROR, WARN, etc.)
- Filter by category
- Search by text

### 3. Export for Analysis

Export logs when debugging complex issues:
- Use JSON format for detailed analysis
- Use CSV format for spreadsheet analysis
- Use Text format for quick reading

### 4. Monitor Performance

Keep an eye on performance logs:
- Look for slow API calls
- Monitor render performance
- Track memory usage patterns

## Troubleshooting

### Common Issues

1. **Logs not appearing**: Check if logging is enabled in config
2. **Too many logs**: Adjust log levels and limits
3. **Performance impact**: Disable debug logging in production
4. **Storage full**: Implement log rotation and cleanup

### Getting Help

Check the console for logging-related errors and ensure all dependencies are properly installed.

## Migration from Existing Code

To migrate existing code to use the new logging system:

1. Replace console.log with enhancedLogger.log
2. Add action logging to user interactions
3. Wrap components in ErrorBoundary
4. Add performance logging to critical operations
5. Use bookManager for book operations

## Future Enhancements

Potential improvements to consider:
- Remote logging service integration
- Real-time log streaming
- Advanced log analytics
- Automated error reporting
- Performance alerts and notifications