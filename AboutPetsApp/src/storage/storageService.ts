import { storage, userStorage, cacheStorage } from './mmkv';
import type { User } from '../types/auth';
import type { Message, Chat } from '../types/chat';

/**
 * Storage Service
 * 
 * Provides a unified interface for local storage operations.
 * Handles user data persistence, message caching, and app settings.
 * Uses MMKV for high-performance storage operations.
 * 
 * Features:
 * - User session persistence
 * - Message caching for offline access
 * - App settings storage
 * - Automatic JSON serialization/deserialization
 */

class StorageService {
  // User Management
  setUser(user: User): void {
    try {
      userStorage.set('current_user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  }

  getUser(): User | null {
    try {
      const userData = userStorage.getString('current_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  clearUser(): void {
    try {
      userStorage.delete('current_user');
    } catch (error) {
      console.error('Failed to clear user:', error);
    }
  }

  // Message Caching
  cacheMessages(chatId: string, messages: Message[]): void {
    try {
      cacheStorage.set(`messages_${chatId}`, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to cache messages:', error);
    }
  }

  getCachedMessages(chatId: string): Message[] {
    try {
      const messagesData = cacheStorage.getString(`messages_${chatId}`);
      return messagesData ? JSON.parse(messagesData) : [];
    } catch (error) {
      console.error('Failed to get cached messages:', error);
      return [];
    }
  }

  clearCachedMessages(chatId: string): void {
    try {
      cacheStorage.delete(`messages_${chatId}`);
    } catch (error) {
      console.error('Failed to clear cached messages:', error);
    }
  }

  // Chat List Caching
  cacheChats(chats: Chat[]): void {
    try {
      cacheStorage.set('cached_chats', JSON.stringify(chats));
    } catch (error) {
      console.error('Failed to cache chats:', error);
    }
  }

  getCachedChats(): Chat[] {
    try {
      const chatsData = cacheStorage.getString('cached_chats');
      return chatsData ? JSON.parse(chatsData) : [];
    } catch (error) {
      console.error('Failed to get cached chats:', error);
      return [];
    }
  }

  // App Settings
  setSetting(key: string, value: any): void {
    try {
      storage.set(`setting_${key}`, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save setting ${key}:`, error);
    }
  }

  getSetting<T>(key: string, defaultValue: T): T {
    try {
      const settingData = storage.getString(`setting_${key}`);
      return settingData ? JSON.parse(settingData) : defaultValue;
    } catch (error) {
      console.error(`Failed to get setting ${key}:`, error);
      return defaultValue;
    }
  }

  // Last Message Timestamp (for sync optimization)
  setLastSyncTimestamp(chatId: string, timestamp: Date): void {
    try {
      storage.set(`last_sync_${chatId}`, timestamp.toISOString());
    } catch (error) {
      console.error('Failed to save sync timestamp:', error);
    }
  }

  getLastSyncTimestamp(chatId: string): Date | null {
    try {
      const timestampString = storage.getString(`last_sync_${chatId}`);
      return timestampString ? new Date(timestampString) : null;
    } catch (error) {
      console.error('Failed to get sync timestamp:', error);
      return null;
    }
  }

  // Utility Methods
  clearAllCache(): void {
    try {
      cacheStorage.clearAll();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  clearAllData(): void {
    try {
      storage.clearAll();
      userStorage.clearAll();
      cacheStorage.clearAll();
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }

  // Get storage size (for debugging/monitoring)
  getStorageInfo(): { general: number; user: number; cache: number } {
    try {
      return {
        general: storage.size,
        user: userStorage.size,
        cache: cacheStorage.size,
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { general: 0, user: 0, cache: 0 };
    }
  }
}

export const storageService = new StorageService();