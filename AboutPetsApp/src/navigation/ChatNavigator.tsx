import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DynamicChatListScreen from '../screens/chat/DynamicChatListScreen';
import { ChatRoomScreen } from '../screens/chat/ChatRoomScreen';
import UserDiscoveryScreen from '../screens/chat/UserDiscoveryScreen';
import type { ChatStackParamList } from '../types';

/**
 * ChatNavigator
 * 
 * Navigation stack for chat-related screens.
 * Handles chat list, individual chat rooms, and user discovery.
 */

const Stack = createNativeStackNavigator<ChatStackParamList>();

export const ChatNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="ChatList"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="ChatList" 
        component={DynamicChatListScreen}
        options={{
          title: 'Chats',
          headerShown: false, // DynamicChatListScreen handles its own header
        }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatRoomScreen}
        options={({ route }) => ({
          title: route.params.chatName || 'Chat',
          headerBackTitleVisible: false,
        })}
      />
      <Stack.Screen 
        name="UserDiscovery" 
        component={UserDiscoveryScreen}
        options={{
          title: 'Discover Pet Lovers',
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};