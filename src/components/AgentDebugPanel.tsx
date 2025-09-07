import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import MagicText from './MagicText';
import { COLORS } from '../assets/colors';
import { debugAgentAuthentication, quickAgentAuthCheck } from '../utils/debugAgentAuth';

interface AgentDebugPanelProps {
  visible?: boolean;
}

const AgentDebugPanel: React.FC<AgentDebugPanelProps> = ({ visible = __DEV__ }) => {
  const [isRunning, setIsRunning] = useState(false);

  const runFullDebug = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    try {
      console.log('Running full agent authentication debug...');
      const result = await debugAgentAuthentication();
      
      Alert.alert(
        'Agent Auth Debug Complete',
        `Check console for detailed results.\n\nStatus: ${result.success ? 'Success' : 'Failed'}\nReason: ${result.reason || 'See console'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Debug panel error:', error);
      Alert.alert('Debug Error', 'Failed to run debug. Check console for details.');
    } finally {
      setIsRunning(false);
    }
  };

  const runQuickCheck = async () => {
    try {
      const result = await quickAgentAuthCheck();
      Alert.alert(
        'Quick Auth Check',
        `Authenticated: ${result.authenticated ? 'Yes' : 'No'}\nRole: ${result.role || 'None'}\nUser ID: ${result.userId || 'None'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Quick check error:', error);
      Alert.alert('Quick Check Error', 'Failed to check auth status.');
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <MagicText style={styles.title}>Agent Debug Panel</MagicText>
      
      <TouchableOpacity 
        style={[styles.button, isRunning && styles.buttonDisabled]} 
        onPress={runQuickCheck}
        disabled={isRunning}
      >
        <MagicText style={styles.buttonText}>Quick Auth Check</MagicText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.buttonSecondary, isRunning && styles.buttonDisabled]} 
        onPress={runFullDebug}
        disabled={isRunning}
      >
        <MagicText style={styles.buttonText}>
          {isRunning ? 'Running Debug...' : 'Full Debug (Console)'}
        </MagicText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 10,
    backgroundColor: COLORS.WHITE,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.GRAY,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.PRIMARY,
    padding: 8,
    borderRadius: 4,
    marginVertical: 2,
  },
  buttonSecondary: {
    backgroundColor: COLORS.SECONDARY || COLORS.GRAY,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default AgentDebugPanel;
