import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AsyncStorage Configuration
 * 
 * Configures AsyncStorage for cross-platform local storage.
 * Used for caching user data, chat messages, and app settings.
 * Compatible with all React Native and Expo configurations.
 */

// Storage keys for different data types
const STORAGE_KEYS = {
  CHAT_APP: 'chat-app-storage',
  USER_SESSION: 'user-session-storage',
  CACHE: 'cache-storage',
} as const;

// AsyncStorage wrapper with MMKV-like interface
class AsyncStorageWrapper {
  private readonly prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  set(key: string, value: string): void {
    AsyncStorage.setItem(this.getKey(key), value).catch(error => {
      console.error(`AsyncStorage set error for key ${key}:`, error);
    });
  }

  getString(key: string): string | undefined {
    try {
      // Note: AsyncStorage is async, but we're providing a sync interface
      // For better compatibility, consider using async methods in your components
      return undefined; // Placeholder - use getStringAsync instead
    } catch (error) {
      console.error(`AsyncStorage get error for key ${key}:`, error);
      return undefined;
    }
  }

  async getStringAsync(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.getKey(key));
    } catch (error) {
      console.error(`AsyncStorage get error for key ${key}:`, error);
      return null;
    }
  }

  async setAsync(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.getKey(key), value);
    } catch (error) {
      console.error(`AsyncStorage set error for key ${key}:`, error);
    }
  }

  delete(key: string): void {
    AsyncStorage.removeItem(this.getKey(key)).catch(error => {
      console.error(`AsyncStorage delete error for key ${key}:`, error);
    });
  }

  async deleteAsync(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error(`AsyncStorage delete error for key ${key}:`, error);
    }
  }

  getAllKeys(): string[] {
    // Return empty array for sync version, use getAllKeysAsync instead
    return [];
  }

  async getAllKeysAsync(): Promise<string[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      return allKeys.filter(key => key.startsWith(`${this.prefix}:`));
    } catch (error) {
      console.error('AsyncStorage getAllKeys error:', error);
      return [];
    }
  }
}

// Main storage instance for general app data
export const storage = new AsyncStorageWrapper(STORAGE_KEYS.CHAT_APP);

// Separate instance for user session data
export const userStorage = new AsyncStorageWrapper(STORAGE_KEYS.USER_SESSION);

// Cache storage for temporary data (messages, images, etc.)
export const cacheStorage = new AsyncStorageWrapper(STORAGE_KEYS.CACHE);