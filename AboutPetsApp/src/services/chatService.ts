import { collection, doc, setDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import type { Chat, Message } from '../types/chat';

/**
 * Chat Service
 * 
 * Provides methods for managing chat operations with Firestore.
 * Handles chat creation, participant management, and message operations.
 * Integrates with Firebase Firestore for real-time data synchronization.
 * 
 * Features:
 * - Create and manage chat rooms
 * - Add/remove participants
 * - Message operations
 * - Chat metadata management
 */

class ChatService {
  /**
   * Create a new chat room
   */
  async createChat(
    participantIds: string[],
    chatName: string,
    createdBy: string
  ): Promise<string> {
    try {
      const chatRef = doc(collection(db, 'chats'));
      const chatData: Omit<Chat, 'id' | 'lastMessage' | 'unreadCount'> = {
        name: chatName,
        participantIds,
        createdAt: new Date(),
        avatar: null,
      };

      await setDoc(chatRef, {
        ...chatData,
        createdBy,
        lastMessageTime: new Date(),
        unreadCounts: participantIds.reduce((acc, id) => {
          acc[id] = 0;
          return acc;
        }, {} as Record<string, number>),
      });

      return chatRef.id;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }

  /**
   * Add a participant to an existing chat
   */
  async addParticipant(chatId: string, userId: string): Promise<void> {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        throw new Error('Chat not found');
      }

      const chatData = chatDoc.data();
      const participantIds = [...chatData.participantIds];

      if (!participantIds.includes(userId)) {
        participantIds.push(userId);
        
        await updateDoc(chatRef, {
          participantIds,
          [`unreadCounts.${userId}`]: 0,
        });
      }
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  }

  /**
   * Remove a participant from a chat
   */
  async removeParticipant(chatId: string, userId: string): Promise<void> {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        throw new Error('Chat not found');
      }

      const chatData = chatDoc.data();
      const participantIds = chatData.participantIds.filter((id: string) => id !== userId);

      await updateDoc(chatRef, {
        participantIds,
        [`unreadCounts.${userId}`]: null, // Remove the unread count
      });
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  }

  /**
   * Delete a chat (only if user is the creator)
   */
  async deleteChat(chatId: string, userId: string): Promise<void> {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        throw new Error('Chat not found');
      }

      const chatData = chatDoc.data();
      if (chatData.createdBy !== userId) {
        throw new Error('Only chat creator can delete the chat');
      }

      // Delete all messages in the chat
      const messagesQuery = query(collection(db, 'chats', chatId, 'messages'));
      const messagesSnapshot = await getDocs(messagesQuery);
      
      const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete the chat document
      await deleteDoc(chatRef);
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read for a user
   */
  async markAsRead(chatId: string, userId: string): Promise<void> {
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        [`unreadCounts.${userId}`]: 0,
      });
    } catch (error) {
      console.error('Error marking as read:', error);
      throw error;
    }
  }

  /**
   * Get chat details
   */
  async getChatDetails(chatId: string): Promise<Chat | null> {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        return null;
      }

      const data = chatDoc.data();
      return {
        id: chatDoc.id,
        name: data.name,
        avatar: data.avatar,
        participantIds: data.participantIds,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastMessage: data.lastMessage ? {
          id: data.lastMessage.id,
          text: data.lastMessage.text,
          senderId: data.lastMessage.senderId,
          senderName: data.lastMessage.senderName,
          timestamp: data.lastMessage.timestamp?.toDate() || new Date(),
        } : undefined,
        unreadCount: 0, // This would be calculated based on current user
      };
    } catch (error) {
      console.error('Error getting chat details:', error);
      return null;
    }
  }

  /**
   * Search for users to start a chat with
   */
  async searchUsers(query: string, currentUserId: string): Promise<any[]> {
    try {
      // This is a placeholder - in a real app, you'd have a users collection
      // and implement proper search functionality
      const usersQuery = collection(db, 'users');
      const snapshot = await getDocs(usersQuery);
      
      const users = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => 
          user.id !== currentUserId &&
          (user.displayName?.toLowerCase().includes(query.toLowerCase()) ||
           user.email?.toLowerCase().includes(query.toLowerCase()))
        );

      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }
}

export const chatService = new ChatService();