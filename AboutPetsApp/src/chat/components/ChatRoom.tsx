import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useMessages } from '../hooks/useMessages';
import { useSendMessage } from '../hooks/useSendMessage';
import type { Message } from '../../types/chat';

/**
 * MessageBubble Component
 * 
 * Renders individual message bubbles with sender information.
 * Supports different styles for sent vs received messages.
 * Shows timestamp and delivery status.
 */
interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.messageContainer, isOwnMessage ? styles.ownMessage : styles.otherMessage]}>
      <View style={[styles.messageBubble, isOwnMessage ? styles.ownBubble : styles.otherBubble]}>
        {!isOwnMessage && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}
        <Text style={[styles.messageText, isOwnMessage ? styles.ownText : styles.otherText]}>
          {message.text}
        </Text>
        <Text style={[styles.timestamp, isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
};

/**
 * MessageInput Component
 * 
 * Input component for composing and sending messages.
 * Handles text input, send button, and message validation.
 */
interface MessageInputProps {
  onSendMessage: (text: string) => void;
  loading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, loading }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !loading) {
      onSendMessage(trimmedMessage);
      setMessage('');
    }
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInput}
        value={message}
        onChangeText={setMessage}
        placeholder="Type a message..."
        multiline
        maxLength={1000}
        editable={!loading}
      />
      <TouchableOpacity
        style={[styles.sendButton, (!message.trim() || loading) && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!message.trim() || loading}
      >
        <Text style={styles.sendButtonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * ChatRoom Component
 * 
 * Main chat screen for displaying messages and sending new ones.
 * Handles real-time message updates and auto-scrolling.
 * Integrates with useMessages and useSendMessage hooks.
 */
interface ChatRoomProps {
  chatId: string;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ chatId }) => {
  const flatListRef = useRef<FlatList>(null);
  
  const { messages, loading, currentUserId } = useMessages(chatId);
  const { sendMessage, sending } = useSendMessage(chatId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    await sendMessage(text);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble
      message={item}
      isOwnMessage={item.senderId === currentUserId}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>No messages yet</Text>
      <Text style={styles.emptySubtext}>Start the conversation!</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => `${item.id || index}`}
        renderItem={renderMessage}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        contentContainerStyle={messages.length === 0 ? styles.emptyContainer : styles.messagesList}
        showsVerticalScrollIndicator={false}
      />
      
      <MessageInput onSendMessage={handleSendMessage} loading={sending} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    marginVertical: 4,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#e9ecef',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownText: {
    color: 'white',
  },
  otherText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherTimestamp: {
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    alignItems: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e1e1e1',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});