import React, { useContext, createContext, useEffect, useState, useMemo } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from '../../services/firebase';
import { SecureStorageService } from '../../services/secureStorage';
import { UserService } from '../../services/userService';
import type { User } from '../../types/auth';

/**
 * AuthContext Hook
 * 
 * Provides comprehensive authentication state management with Firebase Auth.
 * Features secure token storage, session rehydration, and proper error handling.
 * 
 * Features:
 * - Firebase Auth integration with email/password
 * - Secure token storage using Expo SecureStore
 * - Automatic session rehydration on app launch
 * - Loading states and error handling
 * - Type-safe operations
 */

interface AuthContextType {
  user: User | null;
  loading: boolean;
  initializing: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state and restore session
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check if we have stored credentials
        const hasToken = await SecureStorageService.hasAuthToken();
        
        if (hasToken) {
          console.log('Found stored auth token, waiting for Firebase state...');
        }

        // Set up Firebase auth state listener
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
          if (!mounted) return;

          try {
            if (firebaseUser) {
              // User is signed in
              const userData: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                displayName: firebaseUser.displayName || 'User',
                photoURL: firebaseUser.photoURL,
              };

              // Store user data and token securely
              const token = await firebaseUser.getIdToken();
              await Promise.all([
                SecureStorageService.setAuthToken(token),
                SecureStorageService.setUserId(firebaseUser.uid),
              ]);

              setUser(userData);
              console.log('User authenticated:', userData.email);
            } else {
              // User is signed out
              await SecureStorageService.clearAuthData();
              setUser(null);
              console.log('User signed out');
            }
          } catch (error) {
            console.error('Auth state change error:', error);
            setError('Authentication state error occurred');
          } finally {
            if (mounted) {
              setInitializing(false);
            }
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setError('Failed to initialize authentication');
          setInitializing(false);
        }
      }
    };

    const unsubscribePromise = initializeAuth();

    return () => {
      mounted = false;
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) {
          unsubscribe();
        }
      });
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful for:', email);
      
      // The onAuthStateChanged listener will handle setting user state and storing tokens
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      const getErrorMessage = () => {
        switch (error.code) {
          case 'auth/user-not-found':
            return 'No account found with this email address';
          case 'auth/wrong-password':
            return 'Incorrect password';
          case 'auth/invalid-email':
            return 'Invalid email address';
          case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later';
          default:
            return error.message || 'An error occurred during sign in';
        }
      };
      
      const errorMessage = getErrorMessage();
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      await updateProfile(userCredential.user, { 
        displayName: displayName.trim() 
      });

      // Create user profile in Firestore
      const userData: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        displayName: displayName.trim(),
        photoURL: null,
      };
      
      try {
        await UserService.createOrUpdateProfile(userData);
      } catch (profileError) {
        console.warn('Failed to create user profile, will retry on next auth state change:', profileError);
      }
      
      console.log('Sign up successful for:', email);
      
      // The onAuthStateChanged listener will handle setting user state and storing tokens
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      const getErrorMessage = () => {
        switch (error.code) {
          case 'auth/email-already-in-use':
            return 'An account with this email already exists';
          case 'auth/invalid-email':
            return 'Invalid email address';
          case 'auth/weak-password':
            return 'Password should be at least 6 characters';
          default:
            return error.message || 'An error occurred during account creation';
        }
      };
      
      const errorMessage = getErrorMessage();
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await signOut(auth);
      console.log('Sign out successful');
      
      // The onAuthStateChanged listener will handle clearing user state and tokens
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError('Failed to sign out');
      throw new Error('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = useMemo(() => ({
    user,
    loading,
    initializing,
    error,
    signIn,
    signUp,
    signOut: handleSignOut,
    clearError,
  }), [user, loading, initializing, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};