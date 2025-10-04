/**
 * Validation Utilities
 * 
 * Helper functions for form validation and data validation.
 * Provides consistent validation logic across the app.
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateDisplayName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};

export const validateMessageText = (text: string): boolean => {
  return text.trim().length > 0 && text.trim().length <= 1000;
};

export const validateChatName = (name: string): boolean => {
  return name.trim().length >= 1 && name.trim().length <= 100;
};

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateLoginForm = (email: string, password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email.trim()) {
    errors.push('Email is required');
  } else if (!validateEmail(email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!password) {
    errors.push('Password is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateRegisterForm = (
  email: string,
  password: string,
  confirmPassword: string,
  displayName: string
): ValidationResult => {
  const errors: string[] = [];
  
  if (!email.trim()) {
    errors.push('Email is required');
  } else if (!validateEmail(email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!password) {
    errors.push('Password is required');
  } else if (!validatePassword(password)) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  if (!displayName.trim()) {
    errors.push('Display name is required');
  } else if (!validateDisplayName(displayName)) {
    errors.push('Display name must be between 2 and 50 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};