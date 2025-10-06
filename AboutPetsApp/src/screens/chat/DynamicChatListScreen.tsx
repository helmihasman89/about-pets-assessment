import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/hooks/useAuth';
import { UserService } from '../../services/userService';
import { DynamicChatService, DynamicChat } from '../../services/dynamicChatService';

interface DynamicChatListScreenProps {
  navigation: any;
}

const DynamicChatListScreen: React.FC<DynamicChatListScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<DynamicChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load user's chats
  useEffect(() => {
    if (!user) return;

    let mounted = true;

    // Create user profile if it doesn't exist
    UserService.createOrUpdateProfile(user).catch(error => {
      console.error('Error creating user profile:', error);
    });

    // Subscribe to real-time chat updates
    const unsubscribe = DynamicChatService.subscribeToUserChats(
      user.uid,
      (userChats) => {
        if (mounted) {
          setChats(userChats);
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error loading chats:', error);
        if (mounted) {
          setLoading(false);
          
          // Only show error alert for actual Firebase errors, not empty results
          if (error.message?.includes('Database setup required') || 
              error.message?.includes('indexes')) {
            Alert.alert(
              'Setup Required', 
              'The chat database needs to be configured. Please contact support.'
            );
          } else if (error.message?.includes('Permission denied')) {
            Alert.alert(
              'Authentication Error', 
              'Please sign out and sign in again.'
            );
          } else if (error.message?.includes('unavailable') || 
                     error.message?.includes('network')) {
            Alert.alert(
              'Connection Error', 
              'Unable to connect to chat service. Please check your internet connection and try again.'
            );
          } else {
            Alert.alert('Error', 'Failed to load chats. Please try again.');
          }
        }
      }
    );

    // Fallback timeout in case subscription doesn't trigger
    const fallbackTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.log('Subscription fallback: loading initial chats');
        DynamicChatService.getUserChats(user.uid)
          .then(userChats => {
            if (mounted) {
              setChats(userChats);
              setLoading(false);
            }
          })
          .catch(error => {
            console.error('Fallback chat loading failed:', error);
            if (mounted) {
              setLoading(false);
            }
          });
      }
    }, 5000); // 5 second timeout

    return () => {
      mounted = false;
      clearTimeout(fallbackTimeout);
      unsubscribe();
    };
  }, [user, loading]);

  const refreshChats = useCallback(async () => {
    if (!user) return;

    try {
      setRefreshing(true);
      const userChats = await DynamicChatService.getUserChats(user.uid);
      setChats(userChats);
    } catch (error) {
      console.error('Error refreshing chats:', error);
      Alert.alert('Error', 'Failed to refresh chats. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  const navigateToChat = useCallback((chat: DynamicChat) => {
    let chatName: string;
    
    if (chat.type === 'direct') {
      // For direct chats, show the other participant's name
      const otherParticipant = chat.participants.find(p => p.uid !== user?.uid);
      chatName = otherParticipant?.displayName || 'Chat';
    } else {
      // For group chats, use the chat name
      chatName = chat.name || `Group (${chat.participants.length})`;
    }

    navigation.navigate('Chat', {
      chatId: chat.id,
      chatName,
    });
  }, [user, navigation]);

  const navigateToUserDiscovery = useCallback(() => {
    navigation.navigate('UserDiscovery');
  }, [navigation]);

  const formatLastMessageTime = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return timestamp.toLocaleDateString();
  };

  const renderChatItem = useCallback(({ item }: ListRenderItemInfo<DynamicChat>) => {
    let displayName: string;
    let avatarSource: string | undefined;
    
    if (item.type === 'direct') {
      // For direct chats, show the other participant
      const otherParticipant = item.participants.find(p => p.uid !== user?.uid);
      displayName = otherParticipant?.displayName || 'Unknown User';
      avatarSource = otherParticipant?.photoURL;
    } else {
      // For group chats
      displayName = item.name || `Group (${item.participants.length})`;
    }

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigateToChat(item)}
      >
        <View style={styles.avatarContainer}>
          {avatarSource ? (
            <Image source={{ uri: avatarSource }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {item.type === 'group' && (
            <View style={styles.groupIndicator}>
              <Text style={styles.groupIndicatorText}>{item.participants.length}</Text>
            </View>
          )}
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName} numberOfLines={1}>
              {displayName}
            </Text>
            {item.lastMessage && (
              <Text style={styles.lastMessageTime}>
                {formatLastMessageTime(item.lastMessage.timestamp)}
              </Text>
            )}
          </View>
          
          {item.lastMessage ? (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage.senderName === user?.displayName 
                ? `You: ${item.lastMessage.text}` 
                : `${item.lastMessage.senderName}: ${item.lastMessage.text}`
              }
            </Text>
          ) : (
            <Text style={styles.noMessages}>No messages yet</Text>
          )}

          {item.type === 'group' && (
            <Text style={styles.participantCount}>
              {item.participants.length} participants
            </Text>
          )}
        </View>

        <View style={styles.chatMeta}>
          <View style={styles.unreadIndicator} />
        </View>
      </TouchableOpacity>
    );
  }, [user, navigateToChat]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Chats Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start chatting with other pet lovers!
      </Text>
      <TouchableOpacity
        style={styles.discoverButton}
        onPress={navigateToUserDiscovery}
      >
        <Text style={styles.discoverButtonText}>Discover Pet Lovers</Text>
      </TouchableOpacity>
    </View>
  ), [navigateToUserDiscovery]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your chats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Chats</Text>
          <TouchableOpacity
            style={styles.newChatButton}
            onPress={navigateToUserDiscovery}
          >
            <Text style={styles.newChatButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={refreshChats}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  newChatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newChatButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    flexGrow: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  groupIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#4CAF50',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  groupIndicatorText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  lastMessageTime: {
    fontSize: 12,
    color: '#999',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  noMessages: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  participantCount: {
    fontSize: 12,
    color: '#007AFF',
  },
  chatMeta: {
    alignItems: 'center',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  discoverButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  discoverButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DynamicChatListScreen;
