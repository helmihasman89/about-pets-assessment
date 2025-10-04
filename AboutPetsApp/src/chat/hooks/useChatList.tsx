import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../auth/hooks/useAuth';
import type { Chat } from '../../types/chat';

/**
 * useChatList Hook
 * 
 * Manages chat list data and real-time updates.
 * Fetches user's chat rooms from Firestore.
 * Provides refresh functionality and loading states.
 * 
 * Features:
 * - Real-time chat list updates
 * - Pull-to-refresh support
 * - Loading and error states
 * - Automatic subscription cleanup
 */
export const useChatList = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setChats([]);
      setLoading(false);
      return;
    }

    // Query chats where user is a participant
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participantIds', 'array-contains', user.uid),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(
      chatsQuery,
      (snapshot) => {
        const chatList: Chat[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          chatList.push({
            id: doc.id,
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
            unreadCount: data.unreadCounts?.[user.uid] || 0,
          });
        });

        setChats(chatList);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.error('Error fetching chats:', error);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    // The real-time listener will handle the refresh
    // In a real app, you might want to force a cache refresh here
  };

  return {
    chats,
    loading,
    refreshing,
    onRefresh,
  };
};