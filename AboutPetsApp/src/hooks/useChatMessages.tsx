import { useState, useEffect, useCallback } from 'react';
import { Message } from '../types/chat';
import { ChatFirestoreService } from '../services/chatFirestoreService';
import { MessageCacheService } from '../services/messageCacheService';

interface UseChatMessagesProps {
  chatId: string;
  currentUserId: string;
  currentUserName: string;
}

interface UseChatMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  retryMessage: (message: Message) => Promise<void>;
}

/**
 * Custom hook for managing chat messages with real-time updates
 * and optimistic updates for better UX
 */
export const useChatMessages = ({
  chatId,
  currentUserId,
  currentUserName,
}: UseChatMessagesProps): UseChatMessagesReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load cached messages on mount
  useEffect(() => {
    const cachedMessages = MessageCacheService.loadMessages(chatId);
    if (cachedMessages.length > 0) {
      setMessages(cachedMessages);
      setLoading(false);
    }
  }, [chatId]);

  // Subscribe to real-time messages
  useEffect(() => {
    const unsubscribe = ChatFirestoreService.subscribeToMessages(
      chatId,
      (newMessages: Message[]) => {
        setMessages(newMessages);
        setLoading(false);
        setError(null);
        
        // Save to cache
        MessageCacheService.saveMessages(chatId, newMessages);
      },
      (err: Error) => {
        console.error('Real-time listener error:', err);
        setError('Failed to load messages');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [chatId]);

  // Send message with optimistic update
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const messageText = text.trim();

    // Create temporary message for optimistic update
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      text: messageText,
      senderId: currentUserId,
      senderName: currentUserName,
      timestamp: new Date(),
      chatId,
      status: 'sending',
    };

    // Optimistic update - add message to local state immediately
    setMessages(prevMessages => [tempMessage, ...prevMessages]);

    try {
      // Send to Firestore
      const messageId = await ChatFirestoreService.sendMessage({
        text: messageText,
        senderId: currentUserId,
        senderName: currentUserName,
        chatId,
      });

      // Update local message with real ID and sent status
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === tempMessage.id
            ? { ...msg, id: messageId, status: 'sent' }
            : msg
        )
      );
    } catch (sendError) {
      console.error('Failed to send message:', sendError);
      
      // Update message status to failed
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === tempMessage.id
            ? { ...msg, status: 'failed' }
            : msg
        )
      );

      throw sendError;
    }
  }, [currentUserId, currentUserName, chatId]);

  // Retry failed message
  const retryMessage = useCallback(async (message: Message) => {
    if (message.status !== 'failed') return;

    // Update status to sending
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === message.id
          ? { ...msg, status: 'sending' }
          : msg
      )
    );

    try {
      const messageId = await ChatFirestoreService.sendMessage({
        text: message.text,
        senderId: message.senderId,
        senderName: message.senderName,
        chatId: message.chatId,
      });

      // Update with real ID and sent status
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === message.id
            ? { ...msg, id: messageId, status: 'sent' }
            : msg
        )
      );
    } catch (retryError) {
      console.error('Failed to retry message:', retryError);
      
      // Update status back to failed
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === message.id
            ? { ...msg, status: 'failed' }
            : msg
        )
      );

      throw retryError;
    }
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    retryMessage,
  };
};
