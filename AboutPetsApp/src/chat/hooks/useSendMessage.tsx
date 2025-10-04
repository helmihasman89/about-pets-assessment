import { useState } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../auth/hooks/useAuth';

/**
 * useSendMessage Hook
 * 
 * Handles sending messages to a specific chat room.
 * Updates both the messages collection and chat's last message.
 * Provides sending state and error handling.
 * 
 * Features:
 * - Send messages to Firestore
 * - Update chat's last message timestamp
 * - Sending state management
 * - Error handling and validation
 */
export const useSendMessage = (chatId: string) => {
  const [sending, setSending] = useState(false);
  const { user } = useAuth();

  const sendMessage = async (text: string) => {
    if (!user || !chatId || !text.trim()) {
      throw new Error('Invalid message data');
    }

    setSending(true);

    try {
      // Add message to messages subcollection
      const messageData = {
        text: text.trim(),
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        timestamp: serverTimestamp(),
        chatId,
      };

      const messageRef = await addDoc(
        collection(db, 'chats', chatId, 'messages'),
        messageData
      );

      // Update chat's last message and timestamp
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: {
          id: messageRef.id,
          text: text.trim(),
          senderId: user.uid,
          senderName: user.displayName || 'Anonymous',
          timestamp: serverTimestamp(),
        },
        lastMessageTime: serverTimestamp(),
      });

    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setSending(false);
    }
  };

  return {
    sendMessage,
    sending,
  };
};