import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { ChatRoom } from '../../chat/components/ChatRoom';
import type { ChatStackParamList } from '../../types/navigation';

/**
 * ChatRoomScreen
 * 
 * Screen that displays an individual chat room with messages.
 * Wraps the ChatRoom component and provides screen-level context.
 */

type ChatRoomScreenRouteProp = RouteProp<ChatStackParamList, 'Chat'>;

interface ChatRoomScreenProps {
  route: ChatRoomScreenRouteProp;
}

export const ChatRoomScreen: React.FC<ChatRoomScreenProps> = ({ route }) => {
  const { chatId } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ChatRoom chatId={chatId} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
});