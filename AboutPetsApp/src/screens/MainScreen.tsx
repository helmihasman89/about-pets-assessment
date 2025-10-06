import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/hooks/useAuth';
import { ChatNavigator } from '../navigation/ChatNavigator';

const Stack = createNativeStackNavigator();

/**
 * MainScreen
 * 
 * Main application screen shown after successful authentication.
 * Now displays the chat interface as the primary feature.
 */

// Header logout button component
const LogoutButton: React.FC = () => {
  const { signOut, loading } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            signOut().catch((error) => {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            });
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.logoutButton}
      onPress={handleLogout}
      disabled={loading}
    >
      <Text style={styles.logoutButtonText}>
        {loading ? '...' : 'Sign Out'}
      </Text>
    </TouchableOpacity>
  );
};

const headerRightComponent = () => <LogoutButton />;

export const MainScreen: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="ChatMain" 
        component={ChatNavigator}
        options={{
          title: 'About Pets Chat',
          headerRight: headerRightComponent,
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 10,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});