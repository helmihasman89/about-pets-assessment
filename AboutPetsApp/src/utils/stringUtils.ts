/**
 * String Utilities
 * 
 * Helper functions for string manipulation and formatting.
 * Provides consistent string operations across the app.
 */

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + '...';
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatDisplayName = (name: string): string => {
  return name
    .split(' ')
    .map(word => capitalizeFirstLetter(word))
    .join(' ')
    .trim();
};

export const generateChatId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const generateMessageId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

export const extractMentions = (text: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
};

export const highlightMentions = (text: string, currentUserId: string): string => {
  return text.replace(/@(\w+)/g, (match, username) => {
    if (username === currentUserId) {
      return `<mention>${match}</mention>`;
    }
    return match;
  });
};