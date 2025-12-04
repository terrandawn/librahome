import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { logger, getStoredLogs, clearStoredLogs, exportLogsToFile } from '../utils/logger';

const LogViewer = ({ visible, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all'); // all, info, warn, error, debug
  const [exportFormat, setExportFormat] = useState('json');

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

  const exportLogs = async () => {
    try {
      const exportData = await exportLogsToFile(exportFormat);
      
      if (exportData.content) {
        await Share.share({
          message: exportData.content,
          title: `App Logs (${exportFormat.toUpperCase()})`,
        });
        logger.info(`Logs exported in ${exportFormat} format`);
      }
    } catch (error) {
      logger.error('Failed to export logs', error);
      Alert.alert('Error', 'Failed to export logs');
    }
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
        <View style={styles.titleRow}>
          <Text style={styles.title}>Application Logs</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
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
            style={[styles.filterButton, filter === 'info' && styles.activeFilter]}
            onPress={() => setFilter('info')}
          >
            <Text style={styles.filterButtonText}>Info</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'debug' && styles.activeFilter]}
            onPress={() => setFilter('debug')}
          >
            <Text style={styles.filterButtonText}>Debug</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionRow}>
          <View style={styles.exportFormatButtons}>
            {['json', 'text', 'csv'].map(format => (
              <TouchableOpacity
                key={format}
                style={[
                  styles.formatButton,
                  exportFormat === format && styles.formatButtonActive
                ]}
                onPress={() => setExportFormat(format)}
              >
                <Text style={[
                  styles.formatButtonText,
                  exportFormat === format && styles.formatButtonTextActive
                ]}>
                  {format.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={exportLogs}
          >
            <Ionicons name="download" size={16} color="#fff" />
            <Text style={styles.exportButtonText}>Export</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearLogs}
          >
            <Ionicons name="trash" size={16} color="#fff" />
            <Text style={styles.clearButtonText}>Clear</Text>
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exportFormatButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  formatButton: {
    backgroundColor: '#4a5568',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  formatButtonActive: {
    backgroundColor: '#38a169',
  },
  formatButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  formatButtonTextActive: {
    color: '#fff',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38a169',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e53e3e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
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