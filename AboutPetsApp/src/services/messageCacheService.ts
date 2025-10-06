import { cacheStorage } from '../storage/mmkv';
import { Message } from '../types/chat';

/**
 * Local storage service for caching chat messages using MMKV
 * Stores the last 50 messages per chat for offline viewing
 */

export class MessageCacheService {
  private static getCacheKey(chatId: string): string {
    return `messages_${chatId}`;
  }

  /**
   * Save messages to local cache
   * Keeps only the most recent 50 messages
   */
  static saveMessages(chatId: string, messages: Message[]): void {
    try {
      // Sort messages by timestamp (newest first) and take only the last 50
      const sortedMessages = [...messages]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 50);

      // Convert dates to ISO strings for storage
      const messagesToStore = sortedMessages.map(message => ({
        ...message,
        timestamp: message.timestamp.toISOString(),
      }));

      const cacheKey = this.getCacheKey(chatId);
      cacheStorage.set(cacheKey, JSON.stringify(messagesToStore));
    } catch (error) {
      console.error('Error saving messages to cache:', error);
    }
  }

  /**
   * Load messages from local cache
   */
  static loadMessages(chatId: string): Message[] {
    try {
      const cacheKey = this.getCacheKey(chatId);
      const cachedData = cacheStorage.getString(cacheKey);

      if (!cachedData) {
        return [];
      }

      const parsedMessages = JSON.parse(cachedData);
      
      // Convert ISO strings back to Date objects
      return parsedMessages.map((message: any) => ({
        ...message,
        timestamp: new Date(message.timestamp),
      }));
    } catch (error) {
      console.error('Error loading messages from cache:', error);
      return [];
    }
  }

  /**
   * Clear cached messages for a specific chat
   */
  static clearMessages(chatId: string): void {
    try {
      const cacheKey = this.getCacheKey(chatId);
      cacheStorage.delete(cacheKey);
    } catch (error) {
      console.error('Error clearing messages cache:', error);
    }
  }

  /**
   * Clear all cached messages
   */
  static clearAllMessages(): void {
    try {
      const keys = cacheStorage.getAllKeys();
      const messageKeys = keys.filter(key => key.startsWith('messages_'));
      
      messageKeys.forEach(key => {
        cacheStorage.delete(key);
      });
    } catch (error) {
      console.error('Error clearing all messages cache:', error);
    }
  }
}
