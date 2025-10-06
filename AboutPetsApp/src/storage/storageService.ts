import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Service
 * 
 * High-level storage operations for the chat app using AsyncStorage.
 * Handles user preferences, message caching, and app settings.
 */

// Storage keys
const STORAGE_KEYS = {
  USER_TOKEN: '@chat_app:user_token',
  USER_DATA: '@chat_app:user_data',
  CHAT_CACHE: '@chat_app:chat_cache',
  APP_SETTINGS: '@chat_app:app_settings',
  MESSAGES_CACHE: '@chat_app:messages_cache',
} as const;

export class StorageService {
  /**
   * Generic helper methods
   */
  private static async setObject(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting object for key ${key}:`, error);
    }
  }

  private static async getObject<T>(key: string): Promise<T | null> {
    try {
      const jsonString = await AsyncStorage.getItem(key);
      return jsonString ? JSON.parse(jsonString) : null;
    } catch (error) {
      console.error(`Error getting object for key ${key}:`, error);
      return null;
    }
  }

  /**
   * User Authentication Storage
   */
  static async saveUserToken(token: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
  }

  static async getUserToken(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
  }

  static async removeUserToken(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
  }

  /**
   * User Data Storage
   */
  static async saveUserData(userData: any): Promise<void> {
    await this.setObject(STORAGE_KEYS.USER_DATA, userData);
  }

  static async getUserData<T>(): Promise<T | null> {
    return await this.getObject<T>(STORAGE_KEYS.USER_DATA);
  }

  static async removeUserData(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  /**
   * Chat Cache Storage
   */
  static async saveChatCache(chatId: string, messages: any[]): Promise<void> {
    const cacheKey = `${STORAGE_KEYS.MESSAGES_CACHE}:${chatId}`;
    await this.setObject(cacheKey, messages);
  }

  static async getChatCache<T>(chatId: string): Promise<T[] | null> {
    const cacheKey = `${STORAGE_KEYS.MESSAGES_CACHE}:${chatId}`;
    return await this.getObject<T[]>(cacheKey);
  }

  static async removeChatCache(chatId: string): Promise<void> {
    const cacheKey = `${STORAGE_KEYS.MESSAGES_CACHE}:${chatId}`;
    await AsyncStorage.removeItem(cacheKey);
  }

  /**
   * App Settings Storage
   */
  static async saveAppSettings(settings: any): Promise<void> {
    await this.setObject(STORAGE_KEYS.APP_SETTINGS, settings);
  }

  static async getAppSettings<T>(): Promise<T | null> {
    return await this.getObject<T>(STORAGE_KEYS.APP_SETTINGS);
  }

  /**
   * Clear all app data
   */
  static async clearAllData(): Promise<void> {
    await AsyncStorage.clear();
  }

  /**
   * Clear user-specific data (for logout)
   */
  static async clearUserData(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
      // Keep app settings but clear user-specific data
    ]);
  }
}

export default StorageService;