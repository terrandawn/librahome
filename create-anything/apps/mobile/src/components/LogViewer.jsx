import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { logger, getStoredLogs, clearStoredLogs } from '../utils/logger';

const LogViewer = ({ visible, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all'); // all, info, warn, error, debug

  useEffect(() => {
    if (visible) {
      loadLogs();
    }
  }, [visible, filter]);

  const loadLogs = async () => {
    try {
      const storedLogs = await getStoredLogs(100);
      const filteredLogs = filter === 'all' 
        ? storedLogs 
        : storedLogs.filter(log => log.level === filter.toUpperCase());
      setLogs(filteredLogs.reverse()); // Show newest first
    } catch (error) {
      logger.error('Failed to load logs', error);
    }
  };

  const clearLogs = () => {
    Alert.alert(
      'Clear Logs',
      'Are you sure you want to clear all stored logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearStoredLogs();
              setLogs([]);
              logger.info('Logs cleared by user');
            } catch (error) {
              logger.error('Failed to clear logs', error);
            }
          }
        }
      ]
    );
  };

  const getLogColor = (level) => {
    switch (level) {
      case 'ERROR': return '#e53e3e';
      case 'WARN': return '#d69e2e';
      case 'INFO': return '#3182ce';
      case 'DEBUG': return '#718096';
      default: return '#2d3748';
    }
  };

  const formatLogEntry = (log) => {
    const timestamp = new Date(log.timestamp).toLocaleTimeString();
    const color = getLogColor(log.level);
    
    return (
      <View key={log.id} style={[styles.logEntry, { borderLeftColor: color }]}>
        <View style={styles.logHeader}>
          <Text style={[styles.logLevel, { color }]}>
            {log.level}
          </Text>
          <Text style={styles.logTimestamp}>
            {timestamp}
          </Text>
        </View>
        <Text style={styles.logMessage}>
          {log.message}
        </Text>
        {log.data && (
          <Text style={styles.logData}>
            Data: {JSON.stringify(log.data, null, 2)}
          </Text>
        )}
        {log.context && Object.keys(log.context).length > 0 && (
          <Text style={styles.logContext}>
            Context: {JSON.stringify(log.context, null, 2)}
          </Text>
        )}
      </View>
    );
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Application Logs</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
            onPress={() => setFilter('all')}
          >
            <Text style={styles.filterButtonText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'error' && styles.activeFilter]}
            onPress={() => setFilter('error')}
          >
            <Text style={styles.filterButtonText}>Errors</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'warn' && styles.activeFilter]}
            onPress={() => setFilter('warn')}
          >
            <Text style={styles.filterButtonText}>Warnings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearLogs}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.logContainer} contentContainerStyle={styles.logContent}>
        {logs.length === 0 ? (
          <Text style={styles.noLogs}>No logs to display</Text>
        ) : (
          logs.map(formatLogEntry)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  header: {
    backgroundColor: '#2d3748',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4a5568',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  filterButton: {
    backgroundColor: '#4a5568',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  activeFilter: {
    backgroundColor: '#3182ce',
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  clearButton: {
    backgroundColor: '#e53e3e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginLeft: 'auto',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#718096',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logContainer: {
    flex: 1,
  },
  logContent: {
    padding: 8,
  },
  logEntry: {
    backgroundColor: '#2d3748',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logLevel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  logTimestamp: {
    fontSize: 12,
    color: '#a0aec0',
  },
  logMessage: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  logData: {
    color: '#a0aec0',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  logContext: {
    color: '#a0aec0',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  noLogs: {
    color: '#a0aec0',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});

export default LogViewer;