/**
 * Logging Demo Component
 * Demonstrates various logging features and best practices
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { enhancedLogger, actionLogger, bookManager } from '../config/logging';
import { useActionLogger } from '../utils/actionLogger';
import EnhancedErrorBoundary from './EnhancedErrorBoundary';

const LoggingDemo = ({ navigation }) => {
  const [logs, setLogs] = useState([]);
  const [counter, setCounter] = useState(0);
  const [textInput, setTextInput] = useState('');
  const { logClick, logFormSubmit, logNavigation } = useActionLogger('LoggingDemo');

  useEffect(() => {
    // Log screen view
    actionLogger.logScreenView('LoggingDemo');
    
    // Performance logging
    const startTime = Date.now();
    
    // Simulate some work
    setTimeout(() => {
      const duration = Date.now() - startTime;
      enhancedLogger.logPerformance('demo_component_mount', duration);
    }, 100);
  }, []);

  const handleButtonClick = (action, data = {}) => {
    logClick(action, data);
    
    switch (action) {
      case 'increment':
        const newCounter = counter + 1;
        setCounter(newCounter);
        enhancedLogger.logUserAction('counter_increment', {
          oldValue: counter,
          newValue: newCounter
        });
        break;
        
      case 'reset':
        setCounter(0);
        enhancedLogger.logUserAction('counter_reset', {
          previousValue: counter
        });
        break;
        
      case 'test_error':
        logClick('trigger_error');
        throw new Error('This is a test error for demonstration');
        
      case 'test_performance':
        logClick('test_performance');
        testPerformanceLogging();
        break;
        
      case 'add_book':
        logClick('add_book_demo');
        addTestBook();
        break;
        
      case 'api_test':
        logClick('api_test');
        testApiLogging();
        break;
        
      case 'navigation_test':
        logNavigation('Profile', 'push');
        navigation.navigate('Profile');
        break;
    }
  };

  const testPerformanceLogging = () => {
    const startTime = Date.now();
    
    // Simulate some heavy work
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.random();
    }
    
    const duration = Date.now() - startTime;
    enhancedLogger.logPerformance('heavy_computation', duration, 'ms', {
      iterations: 1000000,
      result: result.toFixed(2)
    });
    
    Alert.alert('Performance Test', `Computation completed in ${duration}ms`);
  };

  const addTestBook = async () => {
    try {
      const newBook = await bookManager.addBook({
        title: `Test Book ${Date.now()}`,
        author: 'Demo Author',
        isbn: `978-0-${Math.floor(Math.random() * 10000000000)}`,
        genre: 'Fiction',
        description: 'This is a test book added for logging demonstration.'
      });
      
      Alert.alert('Success', `Book "${newBook.title}" added successfully!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add book');
    }
  };

  const testApiLogging = async () => {
    const startTime = Date.now();
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const endTime = Date.now();
      enhancedLogger.logApiCall('GET', '/api/test', startTime, endTime, 200);
      
      Alert.alert('API Test', 'API call completed successfully');
    } catch (error) {
      const endTime = Date.now();
      enhancedLogger.logApiCall('GET', '/api/test', startTime, endTime, null, error);
      
      Alert.alert('API Error', 'API call failed');
    }
  };

  const handleFormSubmit = () => {
    logFormSubmit('demo_form', { textInput }, 'LoggingDemo');
    enhancedLogger.logUserAction('form_submitted', {
      form: 'demo_form',
      textLength: textInput.length
    });
    
    Alert.alert('Form Submitted', `Text: ${textInput}`);
    setTextInput('');
  };

  const handleLogExport = async () => {
    try {
      const { exportLogsToFile } = require('../utils/logger');
      const exportData = await exportLogsToFile('json');
      
      Alert.alert(
        'Logs Exported',
        `Logs exported successfully. Total characters: ${exportData.content.length}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Export Failed', error.message);
    }
  };

  return (
    <EnhancedErrorBoundary>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Logging Demo</Text>
          <Text style={styles.subtitle}>Test all logging features</Text>
        </View>

        {/* Counter Demo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Counter Demo</Text>
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>Count: {counter}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.incrementButton]}
                onPress={() => handleButtonClick('increment')}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.buttonText}>Increment</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.resetButton]}
                onPress={() => handleButtonClick('reset')}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Form Demo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Form Demo</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter some text..."
            value={textInput}
            onChangeText={setTextInput}
            onSubmitEditing={handleFormSubmit}
          />
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleFormSubmit}
          >
            <Ionicons name="send" size={20} color="#fff" />
            <Text style={styles.buttonText}>Submit Form</Text>
          </TouchableOpacity>
        </View>

        {/* Performance Demo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Demo</Text>
          <TouchableOpacity
            style={[styles.button, styles.performanceButton]}
            onPress={() => handleButtonClick('test_performance')}
          >
            <Ionicons name="speedometer" size={20} color="#fff" />
            <Text style={styles.buttonText}>Test Performance</Text>
          </TouchableOpacity>
        </View>

        {/* Book Management Demo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Book Management Demo</Text>
          <TouchableOpacity
            style={[styles.button, styles.bookButton]}
            onPress={() => handleButtonClick('add_book')}
          >
            <Ionicons name="book" size={20} color="#fff" />
            <Text style={styles.buttonText}>Add Test Book</Text>
          </TouchableOpacity>
        </View>

        {/* API Demo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Logging Demo</Text>
          <TouchableOpacity
            style={[styles.button, styles.apiButton]}
            onPress={() => handleButtonClick('api_test')}
          >
            <Ionicons name="globe" size={20} color="#fff" />
            <Text style={styles.buttonText}>Test API Call</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation Demo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Navigation Demo</Text>
          <TouchableOpacity
            style={[styles.button, styles.navigationButton]}
            onPress={() => handleButtonClick('navigation_test')}
          >
            <Ionicons name="arrow-forward" size={20} color="#fff" />
            <Text style={styles.buttonText}>Navigate to Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Error Demo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Error Boundary Demo</Text>
          <TouchableOpacity
            style={[styles.button, styles.errorButton]}
            onPress={() => handleButtonClick('test_error')}
          >
            <Ionicons name="warning" size={20} color="#fff" />
            <Text style={styles.buttonText}>Trigger Error</Text>
          </TouchableOpacity>
        </View>

        {/* Export Demo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Logs</Text>
          <TouchableOpacity
            style={[styles.button, styles.exportButton]}
            onPress={handleLogExport}
          >
            <Ionicons name="download" size={20} color="#fff" />
            <Text style={styles.buttonText}>Export Logs</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.instructionText}>
            1. Try all the buttons above to see different types of logging
            {'\n'}2. Open the LogViewer to see the logs in real-time
            {'\n'}3. Check the console for additional debug information
            {'\n'}4. Export logs to analyze them externally
          </Text>
        </View>
      </ScrollView>
    </EnhancedErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  counterContainer: {
    alignItems: 'center',
  },
  counterText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  incrementButton: {
    backgroundColor: '#007AFF',
    flex: 1,
  },
  resetButton: {
    backgroundColor: '#FF9500',
    flex: 1,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#34C759',
  },
  performanceButton: {
    backgroundColor: '#AF52DE',
  },
  bookButton: {
    backgroundColor: '#FF2D55',
  },
  apiButton: {
    backgroundColor: '#5AC8FA',
  },
  navigationButton: {
    backgroundColor: '#FF9500',
  },
  errorButton: {
    backgroundColor: '#FF3B30',
  },
  exportButton: {
    backgroundColor: '#30D158',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default LoggingDemo;