# ChatScreen Component

A real-time chat screen component for React Native Expo apps using Firebase Firestore and MMKV for local storage.

## Features

- ✅ Real-time message updates using Firestore listeners
- ✅ Optimistic updates for better UX (messages appear immediately)
- ✅ Offline support with AsyncStorage local caching (last 50 messages per chat)
- ✅ Performance optimized FlatList with `inverted` prop
- ✅ Message status indicators (sending, sent, failed)
- ✅ Modern chat bubble design with timestamps
- ✅ Keyboard avoiding behavior
- ✅ TypeScript support

## Components

### 1. ChatScreen (`src/screens/chat/ChatScreen.tsx`)
Main chat screen component with all features integrated.

### 2. ChatScreenSimple (`src/screens/chat/ChatScreenSimple.tsx`)
Simplified version using the `useChatMessages` hook.

### 3. MessageBubble (`src/components/MessageBubble.tsx`)
Individual message bubble component with status indicators.

## Services

### 1. ChatFirestoreService (`src/services/chatFirestoreService.ts`)
Handles Firestore operations:
- `subscribeToMessages()` - Real-time message listener
- `sendMessage()` - Send new messages
- `updateMessageStatus()` - Update message status

### 2. MessageCacheService (`src/services/messageCacheService.ts`)
Handles local AsyncStorage:
- `saveMessages()` - Cache messages locally
- `loadMessages()` - Load cached messages
- `clearMessages()` - Clear chat cache

## Hooks

### useChatMessages (`src/hooks/useChatMessages.tsx`)
Custom hook that encapsulates chat logic:
- Message state management
- Real-time subscriptions
- Optimistic updates
- Local caching

## Usage

### Basic Usage

```tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatScreen from './src/screens/chat/ChatScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen}
          initialParams={{
            chatId: 'your-chat-id',
            chatName: 'Chat Room Name'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### With Authentication Context

```tsx
import React, { useContext } from 'react';
import ChatScreen from './src/screens/chat/ChatScreen';
import { AuthContext } from './src/contexts/AuthContext';

const ChatWithAuth: React.FC<{ route: any }> = ({ route }) => {
  const { user } = useContext(AuthContext);
  
  return (
    <ChatScreen
      currentUserId={user.uid}
      currentUserName={user.displayName}
      route={route}
    />
  );
};
```

### Using the Custom Hook

```tsx
import React from 'react';
import { useChatMessages } from './src/hooks/useChatMessages';

const CustomChatComponent: React.FC = () => {
  const { messages, loading, error, sendMessage } = useChatMessages({
    chatId: 'your-chat-id',
    currentUserId: 'user-id',
    currentUserName: 'User Name',
  });

  const handleSend = async () => {
    try {
      await sendMessage('Hello world!');
    } catch (error) {
      console.error('Failed to send:', error);
    }
  };

  // Your custom UI here
  return (
    // ...
  );
};
```

## Firestore Data Structure

The component expects this Firestore structure:

```
chats/{chatId}/messages/{messageId}
{
  text: string,
  senderId: string,
  senderName: string,
  timestamp: Firestore.Timestamp,
  chatId: string,
  status: 'sending' | 'sent' | 'failed',
  type?: 'text' | 'image' | 'file',
  metadata?: object
}
```

## Performance Optimizations

1. **FlatList Performance**:
   - `inverted` prop for bottom-up scrolling
   - `getItemLayout` for consistent item heights
   - `windowSize`, `maxToRenderPerBatch` optimization
   - `removeClippedSubviews` for memory efficiency

2. **React Optimizations**:
   - Memoized `renderItem` function
   - Memoized `keyExtractor`
   - `React.memo` for MessageBubble component

3. **Local Caching**:
   - AsyncStorage for cross-platform local storage
   - Automatic cache management (max 50 messages)
   - Instant loading from cache on app start

## Installation

Make sure you have the required dependencies:

```bash
npm install firebase @react-navigation/native @react-native-async-storage/async-storage
```

## Configuration

1. **Firebase Setup**: Configure your Firebase project and update `src/services/firebase.ts`

2. **AsyncStorage Setup**: The AsyncStorage is configured in `src/storage/asyncStorage.ts`

3. **Types**: Message and chat types are defined in `src/types/chat.ts`

## Error Handling

- Network connection errors are handled gracefully
- Failed messages can be retried (UI hook available)
- Offline mode supported through AsyncStorage caching
- User-friendly error messages and retry options

## Future Enhancements

- [ ] Image/file message support
- [ ] Message reactions
- [ ] Typing indicators
- [ ] Message search
- [ ] Push notifications
- [ ] Message encryption

## Dependencies

- `@react-native-async-storage/async-storage` - Cross-platform local storage
- `firebase` - Backend services
- `@react-navigation/native` - Navigation
- `react-native-safe-area-context` - Safe area handling
