import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/hooks/useAuth';
import { UserService, UserProfile } from '../../services/userService';
import { DynamicChatService } from '../../services/dynamicChatService';

interface UserDiscoveryScreenProps {
  navigation: any;
}

const UserDiscoveryScreen: React.FC<UserDiscoveryScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [selectedPetFilter, setSelectedPetFilter] = useState<string | null>(null);

  const petTypes = ['dogs', 'cats', 'birds', 'fish', 'reptiles', 'small-pets'];

  // Load all users on mount
  useEffect(() => {
    const loadUsers = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const allUsers = await UserService.getAllUsers(user.uid);
        setUsers(allUsers);
        setFilteredUsers(allUsers);
      } catch (error) {
        console.error('Error loading users:', error);
        Alert.alert('Error', 'Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [user]);

  // Handle search
  const handleSearch = useCallback(async (term: string) => {
    if (!user) return;

    setSearchTerm(term);
    
    if (!term.trim()) {
      // If search is empty, show all users or filtered users
      if (selectedPetFilter) {
        const petFilteredUsers = await UserService.getUsersByPetType(selectedPetFilter, user.uid);
        setFilteredUsers(petFilteredUsers);
      } else {
        setFilteredUsers(users);
      }
      return;
    }

    try {
      setSearching(true);
      const searchResults = await UserService.searchUsers(term, user.uid);
      setFilteredUsers(searchResults);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  }, [user, users, selectedPetFilter]);

  // Handle pet type filter
  const handlePetFilter = useCallback(async (petType: string) => {
    if (!user) return;
    
    const newFilter = selectedPetFilter === petType ? null : petType;
    setSelectedPetFilter(newFilter);

    try {
      setLoading(true);
      if (newFilter) {
        const filteredUsers = await UserService.getUsersByPetType(newFilter, user.uid);
        setFilteredUsers(filteredUsers);
      } else {
        // Show all users if no filter
        setFilteredUsers(users);
      }
    } catch (error) {
      console.error('Error filtering users:', error);
    } finally {
      setLoading(false);
    }
  }, [user, users, selectedPetFilter]);

  // Start chat with user
  const startChatWithUser = useCallback(async (targetUser: UserProfile) => {
    if (!user) return;

    try {
      Alert.alert(
        'Start Chat',
        `Do you want to start a chat with ${targetUser.displayName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start Chat',
            onPress: () => {
              DynamicChatService.createDirectChat(
                user.uid,
                user.displayName,
                targetUser.uid,
                targetUser.displayName
              ).then((chatId) => {
                // Navigate to the chat
                navigation.navigate('Chat', {
                  chatId,
                  chatName: targetUser.displayName,
                });
              }).catch((error) => {
                console.error('Error starting chat:', error);
                Alert.alert('Error', 'Failed to start chat. Please try again.');
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error in startChatWithUser:', error);
    }
  }, [user, navigation]);

  const renderUserItem = useCallback(({ item }: ListRenderItemInfo<UserProfile>) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => startChatWithUser(item)}
    >
      <View style={styles.userAvatar}>
        {item.photoURL ? (
          <Image source={{ uri: item.photoURL }} style={styles.avatarImage} />
        ) : (
          <View style={[styles.avatarImage, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {item.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={[styles.onlineIndicator, item.isOnline ? styles.online : styles.offline]} />
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.displayName}</Text>
        <Text style={styles.userBio} numberOfLines={1}>{item.bio}</Text>
        <View style={styles.petInfo}>
          <Text style={styles.petCount}>🐾 {item.petCount || 0} pets</Text>
          <View style={styles.petTypes}>
            {item.petTypes?.slice(0, 2).map((petType, index) => (
              <Text key={petType} style={styles.petType}>
                {petType}{index < (item.petTypes?.length || 0) - 1 && index < 1 ? ', ' : ''}
              </Text>
            ))}
          </View>
        </View>
      </View>
      
      <View style={styles.chatButton}>
        <Text style={styles.chatButtonText}>💬</Text>
      </View>
    </TouchableOpacity>
  ), [startChatWithUser]);

  const renderEmptyComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchTerm ? 'No users found' : 'No pet lovers found'}
      </Text>
      <Text style={styles.emptySubtext}>
        {searchTerm ? 'Try a different search term' : 'Check back later for new members'}
      </Text>
    </View>
  ), [searchTerm]);

  const renderPetFilter = useCallback(() => (
    <View style={styles.filtersContainer}>
      <Text style={styles.filtersTitle}>Filter by Pet Type:</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={petTypes}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedPetFilter === item && styles.filterChipActive
            ]}
            onPress={() => handlePetFilter(item)}
          >
            <Text style={[
              styles.filterChipText,
              selectedPetFilter === item && styles.filterChipTextActive
            ]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filtersContent}
      />
    </View>
  ), [selectedPetFilter, handlePetFilter]);

  if (loading && users.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading pet lovers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover Pet Lovers</Text>
        <Text style={styles.subtitle}>Connect with other pet enthusiasts</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name..."
          value={searchTerm}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searching && <ActivityIndicator style={styles.searchIndicator} />}
      </View>

      {renderPetFilter()}

      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.uid}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyComponent}
        refreshing={loading}
        onRefresh={async () => {
          if (!user) return;
          setLoading(true);
          const allUsers = await UserService.getAllUsers(user.uid);
          setUsers(allUsers);
          if (!selectedPetFilter) {
            setFilteredUsers(allUsers);
          }
          setLoading(false);
        }}
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
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8F8F8',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIndicator: {
    marginLeft: 12,
  },
  filtersContainer: {
    backgroundColor: '#F8F8F8',
    paddingVertical: 12,
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 20,
    marginBottom: 8,
  },
  filtersContent: {
    paddingHorizontal: 20,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 8,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  userAvatar: {
    position: 'relative',
    marginRight: 12,
  },
  avatarImage: {
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
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  online: {
    backgroundColor: '#4CAF50',
  },
  offline: {
    backgroundColor: '#999999',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userBio: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petCount: {
    fontSize: 12,
    color: '#007AFF',
    marginRight: 8,
  },
  petTypes: {
    flexDirection: 'row',
  },
  petType: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatButtonText: {
    fontSize: 20,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default UserDiscoveryScreen;
