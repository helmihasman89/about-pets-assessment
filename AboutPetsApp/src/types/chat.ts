/**
 * Chat Types
 * 
 * TypeScript definitions for chat-related data structures.
 * Includes messages, chats, and real-time communication interfaces.
 */

export interface Message {
  id?: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  chatId: string;
  type?: 'text' | 'image' | 'file';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  };
}

export interface Chat {
  id: string;
  name: string;
  avatar?: string | null;
  participantIds: string[];
  createdAt: Date;
  lastMessage?: {
    id: string;
    text: string;
    senderId: string;
    senderName: string;
    timestamp: Date;
  };
  unreadCount: number;
}

export interface ChatListState {
  chats: Chat[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

export interface MessagesState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
}

export interface SendMessageState {
  sending: boolean;
  error: string | null;
}

export interface Participant {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string | null;
  isOnline?: boolean;
  lastSeen?: Date;
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  avatar?: string | null;
  participants: Participant[];
  createdBy: string;
  createdAt: Date;
  settings: {
    isPrivate: boolean;
    allowInvites: boolean;
    maxParticipants?: number;
  };
}