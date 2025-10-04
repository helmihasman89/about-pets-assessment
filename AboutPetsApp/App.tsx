import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/auth/hooks/useAuth';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { RegisterScreen } from './src/screens/auth/RegisterScreen';
import { MainScreen } from './src/screens/MainScreen';
import { LoadingScreen } from './src/components/LoadingScreen';

// Stack navigator types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * AuthNavigator
 * 
 * Handles navigation routing based on authentication state.
 * Shows loading screen during auth state initialization.
 */
const AuthNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f8f9fa' },
        }}
      >
        {user ? (
          // User is authenticated - show main app
          <Stack.Screen
            name="Main"
            component={MainScreen}
            options={{
              gestureEnabled: false, // Disable swipe back
            }}
          />
        ) : (
          // User is not authenticated - show auth screens
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                title: 'Sign In',
              }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{
                title: 'Create Account',
                headerShown: true,
                headerBackTitleVisible: false,
                headerTintColor: '#007AFF',
                headerStyle: {
                  backgroundColor: '#f8f9fa',
                },
                headerTitleStyle: {
                  fontSize: 18,
                  fontWeight: '600',
                },
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

/**
 * Main App Component
 * 
 * Provides authentication context and navigation to the entire application.
 * Handles session rehydration and routing based on auth state.
 */
export default function App() {
  return (
    <AuthProvider>
      <AuthNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}

