import React, { useContext, createContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { storageService } from '../../storage/storageService';
import type { User } from '../../types/auth';

/**
 * useAuth Hook
 * 
 * Provides authentication state management and operations.
 * Handles user session persistence using MMKV storage.
 * Manages Firebase Auth state changes and user data.
 * 
 * Features:
 * - Auto-restore user session on app launch
 * - Sign in/up with email and password
 * - User state persistence
 * - Sign out functionality
 */

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || 'Anonymous',
          photoURL: firebaseUser.photoURL,
        };
        setUser(userData);
        // Cache user data locally
        storageService.setUser(userData);
      } else {
        setUser(null);
        storageService.clearUser();
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // User state will be updated by onAuthStateChanged listener
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    // User state will be updated by onAuthStateChanged listener
  };

  const handleSignOut = async () => {
    await signOut(auth);
    // User state will be updated by onAuthStateChanged listener
  };

  const restoreSession = async () => {
    try {
      const cachedUser = storageService.getUser();
      if (cachedUser && auth.currentUser) {
        setUser(cachedUser);
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut: handleSignOut,
    restoreSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};