import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../../auth/hooks/useAuth';
import ChatScreen from './ChatScreen';
import ChatScreenSimple from './ChatScreenSimple';

const Stack = createNativeStackNavigator();

// Mock chat data for demonstration
const mockChats = [
  {
    id: 'chat-1',
    name: 'General Discussion',
    lastMessage: 'Hey everyone!',
  },
  {
    id: 'chat-2', 
    name: 'Pet Lovers',
    lastMessage: 'Look at my cute cat!',
  },
  {
    id: 'chat-3',
    name: 'Tech Talk',
    lastMessage: 'What do you think about React Native?',
  },
];

// Remove mock user data - will use actual auth

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
}

interface ChatListScreenProps {
  navigation: any;
}

const ChatListScreen: React.FC<ChatListScreenProps> = ({ navigation }) => {
  const [chats] = useState<Chat[]>(mockChats);

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate('Chat', {
          chatId: item.id,
          chatName: item.name,
        })
      }
    >
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chats</Text>
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        style={styles.chatList}
      />
    </View>
  );
};

// Wrapper component to pass user context to ChatScreen
const ChatScreenWrapper: React.FC<{ route: any }> = ({ route }) => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Please sign in to access chat</Text>
      </View>
    );
  }

  return (
    <ChatScreen
      currentUserId={user.uid}
      currentUserName={user.displayName}
    />
  );
};

const ChatScreenSimpleWrapper: React.FC<{ route: any }> = ({ route }) => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Please sign in to access chat</Text>
      </View>
    );
  }

  return (
    <ChatScreenSimple
      currentUserId={user.uid}
      currentUserName={user.displayName}
    />
  );
};

// Main Chat Navigation (for use within existing navigation structure)
const ChatNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="ChatList">
      <Stack.Screen 
        name="ChatList" 
        component={ChatListScreen}
        options={{ title: 'About Pets Chat' }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreenWrapper}
        options={({ route }) => ({ 
          title: (route.params as any)?.chatName || 'Chat' 
        })}
      />
      <Stack.Screen 
        name="ChatSimple" 
        component={ChatScreenSimpleWrapper}
        options={({ route }) => ({ 
          title: `${(route.params as any)?.chatName || 'Chat'} (Simple)` 
        })}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 20,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
});

export default ChatNavigator;

// Export individual components for flexible usage
export { ChatScreenWrapper, ChatScreenSimpleWrapper, ChatListScreen };

// Alternative usage hook with actual auth
export const useChatWithAuth = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { user } = useAuth();

  const startChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  return {
    selectedChatId,
    currentUser: user,
    chats: mockChats,
    startChat,
    isAuthenticated: !!user,
  };
};
