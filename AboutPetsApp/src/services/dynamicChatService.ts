import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Message } from '../types/chat';

/**
 * Dynamic Chat service for creating and managing chats between users
 * Handles chat creation, participant management, and real-time updates
 */

export interface ChatParticipant {
  uid: string;
  displayName: string;
  photoURL?: string;
  joinedAt: Date;
}

export interface DynamicChat {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  participants: ChatParticipant[];
  participantIds: string[];
  createdBy: string;
  createdAt: Date;
  lastMessage?: {
    id: string;
    text: string;
    senderId: string;
    senderName: string;
    timestamp: Date;
  };
  lastActivity: Date;
  isActive: boolean;
}

export class DynamicChatService {
  /**
   * Create a direct chat between two users
   */
  static async createDirectChat(currentUserId: string, currentUserName: string, targetUserId: string, targetUserName: string): Promise<string> {
    try {
      // Check if chat already exists between these users
      const existingChatId = await this.findDirectChat(currentUserId, targetUserId);
      if (existingChatId) {
        return existingChatId;
      }

      // Create new chat ID (deterministic based on user IDs)
      const chatId = this.generateDirectChatId(currentUserId, targetUserId);
      const chatRef = doc(db, 'chats', chatId);

      const participants: ChatParticipant[] = [
        {
          uid: currentUserId,
          displayName: currentUserName,
          joinedAt: new Date(),
        },
        {
          uid: targetUserId,
          displayName: targetUserName,
          joinedAt: new Date(),
        }
      ];

      const chatData: Omit<DynamicChat, 'id'> = {
        type: 'direct',
        participants,
        participantIds: [currentUserId, targetUserId],
        createdBy: currentUserId,
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true,
      };

      await setDoc(chatRef, {
        ...chatData,
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
      });

      return chatId;
    } catch (error) {
      console.error('Error creating direct chat:', error);
      throw error;
    }
  }

  /**
   * Create a group chat with multiple users
   */
  static async createGroupChat(
    creatorId: string, 
    creatorName: string, 
    participantIds: string[], 
    participantNames: string[], 
    groupName?: string
  ): Promise<string> {
    try {
      const chatRef = doc(collection(db, 'chats'));
      const chatId = chatRef.id;

      const participants: ChatParticipant[] = [
        {
          uid: creatorId,
          displayName: creatorName,
          joinedAt: new Date(),
        },
        ...participantIds.map((id, index) => ({
          uid: id,
          displayName: participantNames[index] || 'User',
          joinedAt: new Date(),
        }))
      ];

      const allParticipantIds = [creatorId, ...participantIds];

      const chatData: Omit<DynamicChat, 'id'> = {
        name: groupName || `Group Chat (${participants.length} members)`,
        type: 'group',
        participants,
        participantIds: allParticipantIds,
        createdBy: creatorId,
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true,
      };

      await setDoc(chatRef, {
        ...chatData,
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
      });

      return chatId;
    } catch (error) {
      console.error('Error creating group chat:', error);
      throw error;
    }
  }

  /**
   * Find existing direct chat between two users
   */
  static async findDirectChat(userId1: string, userId2: string): Promise<string | null> {
    try {
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('type', '==', 'direct'),
        where('participantIds', 'array-contains', userId1)
      );

      const snapshot = await getDocs(q);
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (data.participantIds.includes(userId2)) {
          return doc.id;
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding direct chat:', error);
      return null;
    }
  }

  /**
   * Get all chats for a specific user
   */
  static async getUserChats(userId: string): Promise<DynamicChat[]> {
    try {
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('participantIds', 'array-contains', userId),
        where('isActive', '==', true),
        orderBy('lastActivity', 'desc')
      );

      const snapshot = await getDocs(q);
      const chats: DynamicChat[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        chats.push({
          id: doc.id,
          name: data.name,
          type: data.type,
          participants: data.participants || [],
          participantIds: data.participantIds || [],
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastMessage: data.lastMessage ? {
            ...data.lastMessage,
            timestamp: data.lastMessage.timestamp?.toDate() || new Date(),
          } : undefined,
          lastActivity: data.lastActivity?.toDate() || new Date(),
          isActive: data.isActive !== false,
        });
      });

      return chats;
    } catch (error) {
      console.error('Error getting user chats:', error);
      return [];
    }
  }

  /**
   * Subscribe to real-time chat updates for a user
   */
  static subscribeToUserChats(
    userId: string,
    callback: (chats: DynamicChat[]) => void,
    onError?: (error: Error) => void
  ) {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participantIds', 'array-contains', userId),
      where('isActive', '==', true),
      orderBy('lastActivity', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        try {
          const chats: DynamicChat[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            chats.push({
              id: doc.id,
              name: data.name,
              type: data.type,
              participants: data.participants || [],
              participantIds: data.participantIds || [],
              createdBy: data.createdBy,
              createdAt: data.createdAt?.toDate() || new Date(),
              lastMessage: data.lastMessage ? {
                ...data.lastMessage,
                timestamp: data.lastMessage.timestamp?.toDate() || new Date(),
              } : undefined,
              lastActivity: data.lastActivity?.toDate() || new Date(),
              isActive: data.isActive !== false,
            });
          });
          callback(chats);
        } catch (processingError) {
          console.error('Error processing chat data:', processingError);
          onError?.(new Error('Failed to process chat data'));
        }
      },
      (error) => {
        console.error('Error listening to user chats:', error);
        
        // Provide more specific error messages
        let userFriendlyError: Error;
        if (error.code === 'failed-precondition') {
          userFriendlyError = new Error('Database setup required. Please check Firestore indexes.');
        } else if (error.code === 'permission-denied') {
          userFriendlyError = new Error('Permission denied. Please check your authentication.');
        } else if (error.code === 'unavailable') {
          userFriendlyError = new Error('Service temporarily unavailable. Please try again.');
        } else {
          userFriendlyError = error;
        }
        
        onError?.(userFriendlyError);
      }
    );
  }

  /**
   * Update chat's last message info
   */
  static async updateLastMessage(chatId: string, message: Message): Promise<void> {
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: {
          id: message.id,
          text: message.text,
          senderId: message.senderId,
          senderName: message.senderName,
          timestamp: serverTimestamp(),
        },
        lastActivity: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating last message:', error);
    }
  }

  /**
   * Get chat details by ID
   */
  static async getChatById(chatId: string): Promise<DynamicChat | null> {
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
        type: data.type,
        participants: data.participants || [],
        participantIds: data.participantIds || [],
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastMessage: data.lastMessage ? {
          ...data.lastMessage,
          timestamp: data.lastMessage.timestamp?.toDate() || new Date(),
        } : undefined,
        lastActivity: data.lastActivity?.toDate() || new Date(),
        isActive: data.isActive !== false,
      };
    } catch (error) {
      console.error('Error getting chat by ID:', error);
      return null;
    }
  }

  /**
   * Generate a deterministic chat ID for direct chats
   */
  private static generateDirectChatId(userId1: string, userId2: string): string {
    // Sort IDs to ensure consistency regardless of who starts the chat
    const sortedIds = [userId1, userId2].sort((a, b) => a.localeCompare(b));
    return `direct_${sortedIds[0]}_${sortedIds[1]}`;
  }

  /**
   * Add participant to group chat
   */
  static async addParticipant(chatId: string, userId: string, userName: string): Promise<void> {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const newParticipant: ChatParticipant = {
        uid: userId,
        displayName: userName,
        joinedAt: new Date(),
      };

      await updateDoc(chatRef, {
        participants: arrayUnion(newParticipant),
        participantIds: arrayUnion(userId),
        lastActivity: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  }
}
