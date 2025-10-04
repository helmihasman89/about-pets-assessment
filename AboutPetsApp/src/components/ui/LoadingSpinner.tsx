import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

/**
 * LoadingSpinner Component
 * 
 * Reusable loading spinner component with different sizes and overlay options.
 * Can be used as an overlay or inline component.
 * Provides consistent loading indication across the app.
 */

export interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  overlay?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = '#007AFF',
  overlay = false,
}) => {
  if (overlay) {
    return (
      <View style={styles.overlay}>
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size={size} color={color} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  spinnerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  inline: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});