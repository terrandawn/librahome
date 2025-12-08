import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import LogViewer from '../components/LogViewer';
import { logger, getStoredLogs, clearStoredLogs } from '../utils/logger';
import { Platform } from 'react-native';

export default function DebugScreen() {
  const router = useRouter();
  const [showLogViewer, setShowLogViewer] = useState(false);
  const [logStats, setLogStats] = useState({
    total: 0,
    error: 0,
    warn: 0,
    info: 0,
    debug: 0,
  });

  useEffect(() => {
    loadLogStats();
  }, []);

  const loadLogStats = async () => {
    try {
      const logs = await getStoredLogs(1000);
      const stats = {
        total: logs.length,
        error: logs.filter(log => log.level === 'ERROR').length,
        warn: logs.filter(log => log.level === 'WARN').length,
        info: logs.filter(log => log.level === 'INFO').length,
        debug: logs.filter(log => log.level === 'DEBUG').length,
      };
      setLogStats(stats);
    } catch (error) {
      logger.error('Failed to load log stats', error);
    }
  };

  const clearAllLogs = () => {
    Alert.alert(
      'Clear All Logs',
      'Are you sure you want to clear all stored logs? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearStoredLogs();
              setLogStats({ total: 0, error: 0, warn: 0, info: 0, debug: 0 });
              logger.info('All logs cleared by user');
              Alert.alert('Success', 'All logs have been cleared');
            } catch (error) {
              logger.error('Failed to clear logs', error);
              Alert.alert('Error', 'Failed to clear logs');
            }
          }
        }
      ]
    );
  };

  const testLogging = () => {
    logger.debug('This is a debug message from debug screen');
    logger.info('This is an info message from debug screen');
    logger.warn('This is a warning message from debug screen');
    logger.error('This is an error message from debug screen', new Error('Test error'));
    
    logger.userAction('Test logging action', { screen: 'debug', timestamp: Date.now() });
    logger.navigation('debug', 'debug', { test: true });
    logger.performance('Test metric', 123, 'ms');
    logger.auth('Test auth action', 'test-user', { action: 'test' });
    logger.device('Test device action', { sensor: 'test', value: 42 });
    
    Alert.alert('Test Logs Created', 'Test logs have been added to demonstrate logging functionality');
    loadLogStats();
  };

  const exportLogs = async () => {
    try {
      const logs = await getStoredLogs(500);
      const logText = logs.map(log => 
        `[${log.timestamp}] ${log.level} - ${log.message}\n` +
        (log.data ? `Data: ${JSON.stringify(log.data)}\n` : '') +
        (log.context ? `Context: ${JSON.stringify(log.context)}\n` : '') +
        '---'
      ).join('\n\n');
      
      // In a real app, you might share this via share menu or save to file
      Alert.alert('Export Complete', `Exported ${logs.length} logs. Check console for output.`);
      console.log('=== EXPORTED LOGS ===');
      console.log(logText);
      
      logger.info('Logs exported by user', { count: logs.length });
    } catch (error) {
      logger.error('Failed to export logs', error);
      Alert.alert('Export Failed', 'Failed to export logs');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Debug Tools</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logging Statistics</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{logStats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#e53e3e' }]}>{logStats.error}</Text>
              <Text style={styles.statLabel}>Errors</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#d69e2e' }]}>{logStats.warn}</Text>
              <Text style={styles.statLabel}>Warnings</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#3182ce' }]}>{logStats.info}</Text>
              <Text style={styles.statLabel}>Info</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#718096' }]}>{logStats.debug}</Text>
              <Text style={styles.statLabel}>Debug</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logging Actions</Text>
          <TouchableOpacity style={styles.actionButton} onPress={testLogging}>
            <Text style={styles.actionButtonText}>Create Test Logs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowLogViewer(true)}>
            <Text style={styles.actionButtonText}>View Logs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={exportLogs}>
            <Text style={styles.actionButtonText}>Export Logs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={clearAllLogs}>
            <Text style={styles.actionButtonText}>Clear All Logs</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Information</Text>
          <View style={styles.infoContainer}>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Platform:</Text>
              <Text style={styles.infoValue}>{Platform.OS}</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Version:</Text>
              <Text style={styles.infoValue}>{Platform.Version}</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Environment:</Text>
              <Text style={styles.infoValue}>{__DEV__ ? 'Development' : 'Production'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {showLogViewer && (
        <LogViewer 
          visible={showLogViewer} 
          onClose={() => {
            setShowLogViewer(false);
            loadLogStats();
          }} 
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2d3748',
    borderBottomWidth: 1,
    borderBottomColor: '#4a5568',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#3182ce',
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2d3748',
    padding: 16,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#a0aec0',
    fontSize: 12,
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: '#3182ce',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#e53e3e',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  infoContainer: {
    backgroundColor: '#2d3748',
    padding: 16,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#4a5568',
  },
  infoLabel: {
    color: '#a0aec0',
    fontSize: 14,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});