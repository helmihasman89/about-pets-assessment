import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../auth/hooks/useAuth';
import type { Message } from '../../types/chat';

/**
 * useMessages Hook
 * 
 * Manages messages for a specific chat room.
 * Provides real-time message updates from Firestore.
 * Handles message loading states and current user identification.
 * 
 * Features:
 * - Real-time message synchronization
 * - Automatic message ordering by timestamp
 * - Current user identification for message styling
 * - Loading states and error handling
 */
export const useMessages = (chatId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    // Query messages for the specific chat, ordered by timestamp
    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messageList: Message[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          messageList.push({
            id: doc.id,
            text: data.text,
            senderId: data.senderId,
            senderName: data.senderName,
            timestamp: data.timestamp?.toDate() || new Date(),
            chatId: chatId,
          });
        });

        setMessages(messageList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching messages:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  return {
    messages,
    loading,
    currentUserId: user?.uid || null,
  };
};