import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { User } from '../types/auth';

/**
 * User service for managing user profiles and discovery
 * Handles user profile creation, updates, and finding other users
 */

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  petTypes?: string[];
  location?: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  petCount?: number;
}

export class UserService {
  /**
   * Create or update user profile in Firestore
   */
  static async createOrUpdateProfile(user: User, additionalData?: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      const profileData: Partial<UserProfile> = {
        uid: user.uid,
        displayName: user.displayName || 'Pet Lover',
        email: user.email,
        isOnline: true,
        lastSeen: new Date(),
        ...additionalData,
      };

      // Only add photoURL if it exists and is not null
      if (user.photoURL) {
        profileData.photoURL = user.photoURL;
      }

      if (!userDoc.exists()) {
        // Create new profile
        await setDoc(userRef, {
          ...profileData,
          createdAt: serverTimestamp(),
          bio: additionalData?.bio || '🐾 Pet lover and enthusiast',
          petTypes: additionalData?.petTypes || ['dogs', 'cats'],
          petCount: additionalData?.petCount || 1,
        });
      } else {
        // Update existing profile
        await updateDoc(userRef, {
          ...profileData,
          lastSeen: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error creating/updating user profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return null;
      }

      const data = userDoc.data();
      return {
        uid: data.uid,
        displayName: data.displayName,
        email: data.email,
        photoURL: data.photoURL,
        bio: data.bio,
        petTypes: data.petTypes || [],
        location: data.location,
        isOnline: data.isOnline || false,
        lastSeen: data.lastSeen?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        petCount: data.petCount || 0,
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Search for users by display name or email
   */
  static async searchUsers(searchTerm: string, currentUserId: string): Promise<UserProfile[]> {
    try {
      if (!searchTerm.trim()) {
        return [];
      }

      const usersRef = collection(db, 'users');
      
      // Search by display name (case-insensitive contains)
      const nameQuery = query(
        usersRef,
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff'),
        limit(10)
      );

      const nameSnapshot = await getDocs(nameQuery);
      const users: UserProfile[] = [];

      nameSnapshot.forEach((doc) => {
        if (doc.id !== currentUserId) { // Exclude current user
          const data = doc.data();
          users.push({
            uid: data.uid,
            displayName: data.displayName,
            email: data.email,
            photoURL: data.photoURL,
            bio: data.bio,
            petTypes: data.petTypes || [],
            location: data.location,
            isOnline: data.isOnline || false,
            lastSeen: data.lastSeen?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            petCount: data.petCount || 0,
          });
        }
      });

      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  /**
   * Get all users (for discovery) - excluding current user
   */
  static async getAllUsers(currentUserId: string): Promise<UserProfile[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('lastSeen', 'desc'), limit(50));
      
      const snapshot = await getDocs(q);
      const users: UserProfile[] = [];

      snapshot.forEach((doc) => {
        if (doc.id !== currentUserId) { // Exclude current user
          const data = doc.data();
          users.push({
            uid: data.uid,
            displayName: data.displayName,
            email: data.email,
            photoURL: data.photoURL,
            bio: data.bio,
            petTypes: data.petTypes || [],
            location: data.location,
            isOnline: data.isOnline || false,
            lastSeen: data.lastSeen?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            petCount: data.petCount || 0,
          });
        }
      });

      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  /**
   * Update user online status
   */
  static async updateOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isOnline,
        lastSeen: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  }

  /**
   * Get users by pet type for targeted discovery
   */
  static async getUsersByPetType(petType: string, currentUserId: string): Promise<UserProfile[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('petTypes', 'array-contains', petType),
        orderBy('lastSeen', 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(q);
      const users: UserProfile[] = [];

      snapshot.forEach((doc) => {
        if (doc.id !== currentUserId) { // Exclude current user
          const data = doc.data();
          users.push({
            uid: data.uid,
            displayName: data.displayName,
            email: data.email,
            photoURL: data.photoURL,
            bio: data.bio,
            petTypes: data.petTypes || [],
            location: data.location,
            isOnline: data.isOnline || false,
            lastSeen: data.lastSeen?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            petCount: data.petCount || 0,
          });
        }
      });

      return users;
    } catch (error) {
      console.error('Error getting users by pet type:', error);
      return [];
    }
  }
}
