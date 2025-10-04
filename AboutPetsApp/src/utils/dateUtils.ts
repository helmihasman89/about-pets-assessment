/**
 * Date Utilities
 * 
 * Helper functions for formatting dates and times in the chat app.
 * Provides consistent date formatting across components.
 */

export const formatMessageTime = (timestamp: Date): string => {
  const now = new Date();
  const diffInHours = Math.abs(now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return 'Just now';
  }
  
  if (diffInHours < 24) {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  if (diffInHours < 24 * 7) {
    return timestamp.toLocaleDateString([], { weekday: 'short' });
  }
  
  return timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const formatLastSeen = (timestamp: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.abs(now.getTime() - timestamp.getTime()) / (1000 * 60);
  
  if (diffInMinutes < 1) {
    return 'Just now';
  }
  
  if (diffInMinutes < 60) {
    return `${Math.floor(diffInMinutes)} minutes ago`;
  }
  
  const diffInHours = diffInMinutes / 60;
  if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`;
  }
  
  const diffInDays = diffInHours / 24;
  if (diffInDays < 7) {
    return `${Math.floor(diffInDays)} days ago`;
  }
  
  return timestamp.toLocaleDateString();
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() &&
         date.getMonth() === yesterday.getMonth() &&
         date.getFullYear() === yesterday.getFullYear();
};

export const formatChatListTime = (timestamp: Date): string => {
  if (isToday(timestamp)) {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  if (isYesterday(timestamp)) {
    return 'Yesterday';
  }
  
  const now = new Date();
  const diffInDays = Math.abs(now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24);
  
  if (diffInDays < 7) {
    return timestamp.toLocaleDateString([], { weekday: 'short' });
  }
  
  return timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
};