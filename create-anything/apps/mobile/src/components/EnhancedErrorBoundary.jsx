/**
 * Enhanced Error Boundary Component with Comprehensive Logging
 * Catches and logs all React errors with detailed context
 */

import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { actionLogger } from '../utils/actionLogger';

class EnhancedErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error with comprehensive context
    this.setState({ error, errorInfo });
    
    // Log to our action logger
    actionLogger.logErrorBoundary(error, errorInfo, errorInfo.componentStack);
    
    // Additional error context
    const errorContext = {
      errorId: this.state.errorId,
      componentName: this.getComponentName(),
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      url: typeof window !== 'undefined' ? window.location?.href : 'N/A',
      errorBoundaryProps: this.props
    };

    actionLogger.error('React Error Boundary triggered', error, errorContext);
  }

  getComponentName = () => {
    try {
      return this.props.children?.type?.displayName || 
             this.props.children?.type?.name || 
             'UnknownComponent';
    } catch (e) {
      return 'UnknownComponent';
    }
  };

  handleRestart = () => {
    actionLogger.userAction('error_boundary_restart', {
      errorId: this.state.errorId,
      componentName: this.getComponentName()
    });
    
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    });
    
    // Call restart callback if provided
    if (this.props.onRestart) {
      this.props.onRestart();
    }
  };

  handleReportError = () => {
    actionLogger.userAction('error_boundary_report', {
      errorId: this.state.errorId,
      componentName: this.getComponentName(),
      error: this.state.error?.message,
      errorInfo: this.state.errorInfo
    });
    
    // In a real app, this would send the error report to your service
    if (this.props.onErrorReport) {
      this.props.onErrorReport(this.state.error, this.state.errorInfo);
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function' 
          ? this.props.fallback(this.state.error, this.state.errorInfo)
          : this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
            <Text style={styles.errorMessage}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            
            {this.props.showDetails && (
              <ScrollView style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>Error Details:</Text>
                <Text style={styles.detailsText}>
                  Error ID: {this.state.errorId}
                </Text>
                <Text style={styles.detailsText}>
                  Component: {this.getComponentName()}
                </Text>
                <Text style={styles.detailsText}>
                  Timestamp: {new Date().toLocaleString()}
                </Text>
                
                {this.state.error && (
                  <Text style={styles.detailsText}>
                    {this.state.error.toString()}
                  </Text>
                )}
                
                {this.state.errorInfo?.componentStack && (
                  <View style={styles.stackContainer}>
                    <Text style={styles.stackTitle}>Component Stack:</Text>
                    <Text style={styles.stackText}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.restartButton} 
                onPress={this.handleRestart}
              >
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
              
              {this.props.allowReport && (
                <TouchableOpacity 
                  style={styles.reportButton} 
                  onPress={this.handleReportError}
                >
                  <Text style={styles.buttonText}>Report Error</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  detailsContainer: {
    width: '100%',
    maxHeight: 200,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  stackContainer: {
    marginTop: 12,
  },
  stackTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  stackText: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  restartButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  reportButton: {
    flex: 1,
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

// Hook for functional components
export const useErrorBoundary = () => {
  const handleError = (error, errorInfo = {}) => {
    actionLogger.logErrorBoundary(error, errorInfo, errorInfo.componentStack);
  };

  const logUserError = (error, context = {}) => {
    actionLogger.logError(error, {
      category: 'user_error',
      ...context
    });
  };

  return {
    handleError,
    logUserError
  };
};

export default EnhancedErrorBoundary;