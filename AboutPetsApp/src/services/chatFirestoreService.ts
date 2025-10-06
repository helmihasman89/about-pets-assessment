import { 
  collection, 
  doc, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Message } from '../types/chat';

/**
 * Firestore service for chat messages
 * Handles real-time message updates, sending messages, and status updates
 */

export class ChatFirestoreService {
  /**
   * Subscribe to real-time messages for a specific chat
   */
  static subscribeToMessages(
    chatId: string,
    callback: (messages: Message[]) => void,
    onError?: (error: Error) => void,
    messageLimit: number = 50
  ) {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(
      messagesRef, 
      orderBy('timestamp', 'desc'),
      limit(messageLimit)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const messages: Message[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            text: data.text,
            senderId: data.senderId,
            senderName: data.senderName,
            timestamp: data.timestamp?.toDate() || new Date(),
            chatId: data.chatId,
            type: data.type || 'text',
            status: data.status || 'sent',
            metadata: data.metadata,
          };
        });
        callback(messages);
      },
      (error) => {
        console.error('Error listening to messages:', error);
        onError?.(error);
      }
    );
  }

  /**
   * Send a new message to Firestore
   */
  static async sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'status'>): Promise<string> {
    try {
      const messagesRef = collection(db, 'chats', message.chatId, 'messages');
      const messageData = {
        ...message,
        timestamp: serverTimestamp(),
        status: 'sent',
      };

      const docRef = await addDoc(messagesRef, messageData);
      return docRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Update message status
   */
  static async updateMessageStatus(
    chatId: string, 
    messageId: string, 
    status: 'sending' | 'sent' | 'failed'
  ): Promise<void> {
    try {
      const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
      await updateDoc(messageRef, { status });
    } catch (error) {
      console.error('Error updating message status:', error);
      throw error;
    }
  }
}
