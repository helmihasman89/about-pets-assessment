import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { ChatRoom } from '../../chat/components/ChatRoom';

/**
 * ChatRoomScreen
 * 
 * Screen that displays an individual chat room with messages.
 * Wraps the ChatRoom component and provides screen-level context.
 */

export const ChatRoomScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ChatRoom />
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