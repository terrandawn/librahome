# Logging System Guide

This document describes the comprehensive logging system implemented across both the web and mobile applications.

## Overview

The logging system provides structured, consistent logging across all application components with features including:

- **Multiple log levels**: Debug, Info, Warn, Error
- **Environment-aware logging**: Different behavior for development vs production
- **Structured log data**: Consistent format with timestamps, context, and metadata
- **Categorized logging**: Built-in categories for different types of events
- **Local storage (mobile)**: Persistent logging for debugging in production
- **External service integration**: Ready for integration with logging services

## Web App Logging

### Location
- Utility: `apps/web/src/utils/logger.js`
- Server-side: `apps/web/src/app/api/utils/logger.js`

### Usage

```javascript
import { logger } from '~/utils/logger';

// Basic logging
logger.debug('Debug message', { data: 'optional' }, { context: 'optional' });
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', errorObject);

// Specialized logging
logger.userAction('button_click', { buttonId: 'submit' });
logger.apiCall('GET', '/api/books', 200, 150); // method, url, status, duration
logger.performance('render_time', 42, 'ms');
logger.auth('login_successful', userId, { provider: 'google' });
```

### API Route Logging

For server-side API routes, use the server logger:

```javascript
import { serverLogger, logApiRequest, logApiResponse } from '../utils/logger';

export async function GET(request) {
  const startTime = Date.now();
  
  try {
    logApiRequest(request, startTime);
    // ... your logic
    logApiResponse(request, 200, startTime);
    return Response.json({ data });
  } catch (error) {
    serverLogger.error('API error', error);
    logApiResponse(request, 500, startTime, error);
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
```

## Mobile App Logging

### Location
- Utility: `apps/mobile/src/utils/logger.js`
- Components: `apps/mobile/src/components/LogViewer.jsx`
- Debug Screen: `apps/mobile/src/app/debug.jsx`

### Usage

```javascript
import { logger } from '@/utils/logger';

// Basic logging (same as web)
logger.debug('Debug message', data, context);
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', errorObject);

// Mobile-specific logging
logger.navigation('HomeScreen', 'BookScreen', { bookId: '123' });
logger.device('camera_opened', { resolution: '1080p' });
logger.userAction('swipe_gesture', { direction: 'left' });
logger.apiCall('POST', '/api/books', 201, 250);
logger.performance('screen_load', 180, 'ms');
logger.auth('login_attempt', null, { provider: 'credentials' });
```

### Local Storage Management

```javascript
import { getStoredLogs, clearStoredLogs } from '@/utils/logger';

// Get recent logs
const logs = await getStoredLogs(100); // Get last 100 logs

// Clear all stored logs
await clearStoredLogs();
```

## Log Levels

| Level | Priority | Usage |
|-------|----------|-------|
| DEBUG | 0 | Detailed development information, step-by-step execution |
| INFO | 1 | General application flow, user actions, successful operations |
| WARN | 2 | Potentially problematic situations that don't stop execution |
| ERROR | 3 | Serious errors that may affect functionality |

## Environment Configuration

### Development
- All log levels are enabled
- Colorized console output
- Detailed formatting with data and context

### Production
- INFO level and above (DEBUG logs are filtered out)
- Structured JSON logging
- Error logs can be sent to external services

### Environment Variables

```bash
# Set minimum log level (DEBUG, INFO, WARN, ERROR)
LOG_LEVEL=INFO

# Node environment
NODE_ENV=production
```

## Log Categories

Built-in categories help organize and filter logs:

- `app_lifecycle`: Application startup, initialization, shutdown
- `user_interaction`: User actions, clicks, gestures
- `api_call`: HTTP requests and responses
- `navigation`: Screen/route navigation (mobile)
- `performance`: Performance metrics and timing
- `authentication`: Login, logout, auth events
- `device`: Device-specific events (mobile)
- `database`: Database operations (server)

## Mobile Debug Features

### Log Viewer Component
A full-featured log viewer with:
- Filter by log level
- Color-coded display
- Timestamp formatting
- Expandable data/context sections
- Clear logs functionality

### Debug Screen
Access the debug tools screen by navigating to `/debug`. Features include:
- Log statistics dashboard
- Test logging functionality
- Export logs capability
- System information display
- Direct access to log viewer

## Best Practices

### When to Log

**DO log:**
- User actions that affect state
- API calls and responses
- Authentication events
- Performance metrics
- Error conditions
- Application lifecycle events

**DON'T log:**
- Sensitive personal information
- Passwords, tokens, or secrets
- Excessive repetitive events
- Large binary data
- PII without proper sanitization

### Log Message Guidelines

1. **Be descriptive**: "User clicked submit button" vs "click"
2. **Include context**: What screen, what user, what conditions
3. **Use structured data**: Pass objects instead of concatenated strings
4. **Categorize appropriately**: Use the right category for the event type

### Performance Considerations

- Logging is synchronous but minimal impact
- In production, lower-level logs are filtered out early
- Mobile logs are stored locally with size limits
- Consider batch sending to external services

## External Service Integration

The logging system is ready for integration with services like:

- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: Session replay and error tracking
- **DataDog**: Infrastructure and application monitoring
- **Custom endpoints**: Your own log aggregation service

Example Sentry integration:

```javascript
// In production logger
if (env === 'production' && LOG_LEVELS[level] >= LOG_LEVELS.ERROR) {
  Sentry.captureException(logEntry);
}
```

## Troubleshooting

### Common Issues

1. **Logs not appearing in production**
   - Check LOG_LEVEL environment variable
   - Verify category filtering
   - Ensure console outputs are preserved

2. **Mobile logs not persisting**
   - Check AsyncStorage permissions
   - Verify storage limits (1000 logs max)
   - Check for storage quota exceeded

3. **Performance impact**
   - Reduce DEBUG logging in production
   - Limit data size in log entries
   - Consider debouncing frequent events

### Debug Mode

Enable debug mode by:
- Setting `LOG_LEVEL=DEBUG` environment variable
- Using development builds
- Accessing the debug screen on mobile

## Migration from console.log

Replace existing console.log calls:

```javascript
// Before
console.log('User logged in', userId);
console.error('API failed', error);

// After
logger.auth('login_successful', userId);
logger.error('API call failed', error, { category: 'api_call' });
```

This provides better structure, filtering, and analysis capabilities.