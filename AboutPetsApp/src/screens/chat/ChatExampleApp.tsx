import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

// Mock user data - replace with actual auth
const mockUser = {
  id: 'user-123',
  name: 'John Doe',
};

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
  return (
    <ChatScreen
      currentUserId={mockUser.id}
      currentUserName={mockUser.name}
    />
  );
};

const ChatScreenSimpleWrapper: React.FC<{ route: any }> = ({ route }) => {
  return (
    <ChatScreenSimple
      currentUserId={mockUser.id}
      currentUserName={mockUser.name}
    />
  );
};

// Main App Navigation
const ChatExampleApp: React.FC = () => {
  return (
    <NavigationContainer>
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
    </NavigationContainer>
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

export default ChatExampleApp;

// Alternative usage with hooks
export const useExampleChat = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [currentUser] = useState(mockUser);

  // Initialize Firebase Auth (replace with your auth logic)
  useEffect(() => {
    // Your auth initialization here
    console.log('Initialize auth...');
  }, []);

  const startChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  return {
    selectedChatId,
    currentUser,
    chats: mockChats,
    startChat,
  };
};
