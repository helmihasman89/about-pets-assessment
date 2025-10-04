import React, { forwardRef } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';

/**
 * Input Component
 * 
 * Reusable text input component with label, error states, and validation.
 * Supports various input types and provides consistent styling.
 * Includes proper accessibility features and error handling.
 */

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  required,
  helperText,
  style,
  ...props
}, ref) => {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <TextInput
        ref={ref}
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor="#999"
        {...props}
      />
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  required: {
    color: '#FF3B30',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});