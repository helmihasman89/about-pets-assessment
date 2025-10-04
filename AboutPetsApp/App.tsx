import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';

// Import Firebase services
import { auth } from './src/services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

/**
 * Main App Component
 * 
 * Simplified version to test Firebase connection without navigation complexity.
 * Once this works, we'll add back the navigation and auth providers.
 */
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Listen for authentication state changes
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
        setUser(user);
        setLoading(false);
      });

      // Cleanup subscription on unmount
      return unsubscribe;
    } catch (error) {
      console.error('Firebase Auth Error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.subtitle}>Initializing Firebase...</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Firebase Error</Text>
        <Text style={styles.error}>{error}</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>About Pets Chat App</Text>
      <Text style={styles.subtitle}>
        {user ? `Welcome, ${user.email || 'User'}!` : 'Not logged in'}
      </Text>
      <Text style={styles.status}>
        Firebase Auth Status: {user ? '✅ Connected' : '❌ Not authenticated'}
      </Text>
      <Text style={styles.info}>App is running successfully! 🎉</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  status: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
  info: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
  },
  error: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});