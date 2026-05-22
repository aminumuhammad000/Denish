import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

export const ProgressBar = ({ currentStep, totalSteps, title }) => {
  const progress = currentStep / totalSteps;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepText}>Step {currentStep} of {totalSteps} | {title}</Text>
      </View>
      <View style={styles.BarContainer}>
        <View style={[styles.activeBar, { width: `${progress * 100}%` }]} />
        <View style={[styles.inactiveBar, { width: `${(1 - progress) * 100}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  BarContainer: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: '#EEE',
  },
  activeBar: {
    backgroundColor: Colors.primary,
    height: '100%',
  },
  inactiveBar: {
    backgroundColor: '#EEE',
    height: '100%',
  },
});
