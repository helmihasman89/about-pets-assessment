import * as SecureStore from 'expo-secure-store';

/**
 * Secure Storage Service
 * 
 * Provides secure storage for sensitive data like authentication tokens
 * using Expo SecureStore. Data is encrypted and stored securely on device.
 * 
 * Features:
 * - Secure token storage with encryption
 * - Automatic error handling
 * - Type-safe operations
 * - Easy async/await interface
 */

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ID: 'user_id',
} as const;

export class SecureStorageService {
  /**
   * Store authentication token securely
   */
  static async setAuthToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error storing auth token:', error);
      throw new Error('Failed to store authentication token');
    }
  }

  /**
   * Retrieve authentication token
   */
  static async getAuthToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      return null;
    }
  }

  /**
   * Store refresh token securely
   */
  static async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token);
    } catch (error) {
      console.error('Error storing refresh token:', error);
      throw new Error('Failed to store refresh token');
    }
  }

  /**
   * Retrieve refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error retrieving refresh token:', error);
      return null;
    }
  }

  /**
   * Store user ID
   */
  static async setUserId(userId: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_ID, userId);
    } catch (error) {
      console.error('Error storing user ID:', error);
      throw new Error('Failed to store user ID');
    }
  }

  /**
   * Retrieve user ID
   */
  static async getUserId(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.USER_ID);
    } catch (error) {
      console.error('Error retrieving user ID:', error);
      return null;
    }
  }

  /**
   * Clear all authentication data
   */
  static async clearAuthData(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ID),
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw new Error('Failed to clear authentication data');
    }
  }

  /**
   * Check if authentication token exists
   */
  static async hasAuthToken(): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      return token !== null;
    } catch (error) {
      console.error('Error checking auth token:', error);
      return false;
    }
  }
}

export default SecureStorageService;