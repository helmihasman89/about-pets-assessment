import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Message } from '../../types/chat';
import { ChatFirestoreService } from '../../services/chatFirestoreService';
import { MessageCacheService } from '../../services/messageCacheService';
import MessageBubble from '../../components/MessageBubble';

const { height: screenHeight } = Dimensions.get('window');

type ChatScreenRouteParams = {
  chatId: string;
  chatName: string;
};

type ChatScreenRouteProp = RouteProp<{ ChatScreen: ChatScreenRouteParams }, 'ChatScreen'>;

interface ChatScreenProps {
  // You can pass these as props or get from auth context
  currentUserId?: string;
  currentUserName?: string;
}

// Mock current user - replace with actual auth context
const CURRENT_USER_ID = 'current-user-id';
const CURRENT_USER_NAME = 'Current User';

const ChatScreen: React.FC<ChatScreenProps> = ({ 
  currentUserId = CURRENT_USER_ID, 
  currentUserName = CURRENT_USER_NAME 
}) => {
  const route = useRoute<ChatScreenRouteProp>();
  const { chatId, chatName } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Load cached messages on mount
  useEffect(() => {
    const loadCachedMessages = async () => {
      try {
        const cachedMessages = await MessageCacheService.loadMessages(chatId);
        if (cachedMessages.length > 0) {
          setMessages(cachedMessages);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading cached messages:', error);
      }
    };

    loadCachedMessages();
  }, [chatId]);

  // Subscribe to real-time messages
  useEffect(() => {
    const unsubscribe = ChatFirestoreService.subscribeToMessages(
      chatId,
      (newMessages: Message[]) => {
        setMessages(newMessages);
        setLoading(false);
        setError(null);
        
        // Save to cache (async, but don't await to avoid blocking UI)
        MessageCacheService.saveMessages(chatId, newMessages).catch(error => {
          console.error('Error saving messages to cache:', error);
        });
      },
      (err: Error) => {
        console.error('Real-time listener error:', err);
        setError('Failed to load messages');
        setLoading(false);
      }
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      unsubscribe();
    };
  }, [chatId]);

  // Optimized item layout for better performance
  const getItemLayout = useCallback((_data: ArrayLike<Message> | null | undefined, index: number) => ({
    length: 80, // Approximate message height
    offset: 80 * index,
    index,
  }), []);

  // Memoized render item for performance
  const renderMessage = useCallback(({ item }: ListRenderItemInfo<Message>) => {
    const isOwn = item.senderId === currentUserId;
    return (
      <MessageBubble
        message={item}
        isOwn={isOwn}
        currentUserId={currentUserId}
      />
    );
  }, [currentUserId]);

  // Memoized key extractor
  const keyExtractor = useCallback((item: Message, index: number) => {
    return item.id || `temp-${index}-${item.timestamp.getTime()}`;
  }, []);

  // Send message with optimistic update
  const sendMessage = useCallback(async () => {
    if (!inputText.trim()) return;

    const messageText = inputText.trim();
    setInputText('');

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
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Update message status to failed
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === tempMessage.id
            ? { ...msg, status: 'failed' }
            : msg
        )
      );

      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  }, [inputText, currentUserId, currentUserName, chatId]);

  // Retry failed message functionality (currently unused but available for future features)
  const retryFailedMessage = useCallback(async (message: Message) => {
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
    } catch (error) {
      console.error('Failed to retry message:', error);
      
      // Update status back to failed
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === message.id
            ? { ...msg, status: 'failed' }
            : msg
        )
      );

      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  }, []);

  // Keep retryFailedMessage available for future use
  console.log('Retry function available:', !!retryFailedMessage);

  // Memoized FlatList for performance
  const messagesList = useMemo(() => (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={keyExtractor}
      inverted
      showsVerticalScrollIndicator={false}
      getItemLayout={getItemLayout}
      windowSize={10}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      removeClippedSubviews={true}
      initialNumToRender={15}
      style={styles.messagesList}
      contentContainerStyle={styles.messagesContainer}
    />
  ), [messages, renderMessage, keyExtractor, getItemLayout]);

  if (loading && messages.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{chatName}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && messages.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{chatName}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{chatName}</Text>
        {error && (
          <Text style={styles.headerError}>Connection issues</Text>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        {messagesList}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            multiline
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 60,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerError: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 2,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  messagesContainer: {
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#007AFF',
  },
  sendButtonInactive: {
    backgroundColor: '#C0C0C0',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatScreen;
