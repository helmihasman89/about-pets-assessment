import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

/**
 * Avatar Component
 * 
 * Reusable avatar component for displaying user profile pictures.
 * Supports image URLs and fallback to initials.
 * Provides multiple sizes and customizable styling.
 */

export interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name = 'U',
  size = 'medium',
  style,
}) => {
  const getInitials = (displayName: string) => {
    return displayName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeStyles = styles[size];

  if (source) {
    return (
      <Image
        source={{ uri: source }}
        style={[styles.avatar, sizeStyles, style]}
      />
    );
  }

  return (
    <View style={[styles.avatar, styles.placeholder, sizeStyles, style]}>
      <Text style={[styles.initials, styles[`${size}Text`]]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    backgroundColor: '#007AFF',
  },
  initials: {
    color: 'white',
    fontWeight: '600',
  },
  
  // Sizes
  small: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  medium: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  large: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  
  // Text sizes
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 18,
  },
  largeText: {
    fontSize: 28,
  },
});