import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { ChatList } from '../../chat/components/ChatList';

/**
 * ChatListScreen
 * 
 * Screen that displays the list of user's chat conversations.
 * Wraps the ChatList component and provides navigation context.
 */

export const ChatListScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ChatList />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});