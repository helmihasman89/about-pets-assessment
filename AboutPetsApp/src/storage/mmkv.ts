import { MMKV } from 'react-native-mmkv';

/**
 * MMKV Storage Configuration
 * 
 * Configures MMKV for high-performance local storage.
 * Used for caching user data, chat messages, and app settings.
 * Provides encrypted storage for sensitive data.
 */

// Main storage instance for general app data
export const storage = new MMKV({
  id: 'chat-app-storage',
  encryptionKey: 'your-encryption-key-here' // In production, use a secure key
});

// Separate instance for user session data
export const userStorage = new MMKV({
  id: 'user-session-storage',
  encryptionKey: 'your-user-encryption-key-here'
});

// Cache storage for temporary data (messages, images, etc.)
export const cacheStorage = new MMKV({
  id: 'cache-storage'
});