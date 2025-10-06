import { cacheStorage } from '../storage/asyncStorage';
import { Message } from '../types/chat';

/**
 * Local storage service for caching chat messages using AsyncStorage
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
  static async saveMessages(chatId: string, messages: Message[]): Promise<void> {
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
      await cacheStorage.setAsync(cacheKey, JSON.stringify(messagesToStore));
    } catch (error) {
      console.error('Error saving messages to cache:', error);
    }
  }

  /**
   * Load messages from local cache
   */
  static async loadMessages(chatId: string): Promise<Message[]> {
    try {
      const cacheKey = this.getCacheKey(chatId);
      const cachedData = await cacheStorage.getStringAsync(cacheKey);

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
  static async clearMessages(chatId: string): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(chatId);
      await cacheStorage.deleteAsync(cacheKey);
    } catch (error) {
      console.error('Error clearing messages cache:', error);
    }
  }

  /**
   * Clear all cached messages
   */
  static async clearAllMessages(): Promise<void> {
    try {
      const keys = await cacheStorage.getAllKeysAsync();
      const messageKeys = keys.filter(key => key.includes('messages_'));
      
      await Promise.all(
        messageKeys.map(key => {
          // Extract the actual key by removing the prefix
          const actualKey = key.replace(/^[^:]+:/, '');
          return cacheStorage.deleteAsync(actualKey);
        })
      );
    } catch (error) {
      console.error('Error clearing all messages cache:', error);
    }
  }
}
