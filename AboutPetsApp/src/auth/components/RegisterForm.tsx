import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView 
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

/**
 * RegisterForm Component
 * 
 * Complete registration form with validation, error handling, and loading states.
 * Handles user registration with email, password, and display name.
 * Features real-time validation and user-friendly error messages.
 */

interface RegisterFormProps {
  onNavigateToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onNavigateToLogin }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [displayNameError, setDisplayNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { signUp, loading, error, clearError } = useAuth();

  // Clear auth error when component mounts or form changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [displayName, email, password, confirmPassword]);

  // Display name validation
  const validateDisplayName = (name: string): boolean => {
    if (!name.trim()) {
      setDisplayNameError('Display name is required');
      return false;
    }
    if (name.trim().length < 2) {
      setDisplayNameError('Display name must be at least 2 characters');
      return false;
    }
    if (name.trim().length > 50) {
      setDisplayNameError('Display name must be less than 50 characters');
      return false;
    }
    setDisplayNameError('');
    return true;
  };

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Password validation
  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    if (!/(?=.*[a-z])/.test(password)) {
      setPasswordError('Password must contain at least one lowercase letter');
      return false;
    }
    if (!/(?=.*\d)/.test(password)) {
      setPasswordError('Password must contain at least one number');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Confirm password validation
  const validateConfirmPassword = (confirmPass: string): boolean => {
    if (!confirmPass) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    if (confirmPass !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleDisplayNameChange = (text: string) => {
    setDisplayName(text);
    if (displayNameError) {
      validateDisplayName(text);
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      validateEmail(text);
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) {
      validatePassword(text);
    }
    // Re-validate confirm password if it was entered
    if (confirmPassword && confirmPasswordError) {
      validateConfirmPassword(confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (confirmPasswordError) {
      validateConfirmPassword(text);
    }
  };

  const handleRegister = async () => {
    const isDisplayNameValid = validateDisplayName(displayName);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isDisplayNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    try {
      await signUp(email.trim().toLowerCase(), password, displayName.trim());
      // Navigation is handled by the auth state change in App.tsx
    } catch (error) {
      // Error is handled by the AuthContext and displayed via the error state
      console.log('Registration error handled by context');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us and start chatting!</Text>
          
          {/* Display Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={[styles.input, displayNameError ? styles.inputError : null]}
              placeholder="Enter your display name"
              value={displayName}
              onChangeText={handleDisplayNameChange}
              onBlur={() => validateDisplayName(displayName)}
              autoCapitalize="words"
              autoComplete="name"
              editable={!loading}
            />
            {displayNameError ? <Text style={styles.errorText}>{displayNameError}</Text> : null}
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholder="Enter your email"
              value={email}
              onChangeText={handleEmailChange}
              onBlur={() => validateEmail(email)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>
          
          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput, passwordError ? styles.inputError : null]}
                placeholder="Enter your password"
                value={password}
                onChangeText={handlePasswordChange}
                onBlur={() => validatePassword(password)}
                secureTextEntry={!showPassword}
                autoComplete="password-new"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <Text style={styles.passwordToggleText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            <Text style={styles.helperText}>
              Must be at least 6 characters with one lowercase letter and one number
            </Text>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput, confirmPasswordError ? styles.inputError : null]}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                onBlur={() => validateConfirmPassword(confirmPassword)}
                secureTextEntry={!showConfirmPassword}
                autoComplete="password-new"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                <Text style={styles.passwordToggleText}>
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
            {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
          </View>

          {/* Auth Error Display */}
          {error && (
            <View style={styles.authErrorContainer}>
              <Text style={styles.authErrorText}>{error}</Text>
            </View>
          )}
          
          {/* Create Account Button */}
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Navigate to Login */}
          {onNavigateToLogin && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity 
                onPress={onNavigateToLogin}
                disabled={loading}
              >
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    padding: 24,
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    marginRight: 0,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  passwordToggleText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  authErrorContainer: {
    backgroundColor: '#FFE6E6',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  authErrorText: {
    color: '#D63031',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});