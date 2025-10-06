# Firestore Setup Requirements

## Required Firestore Indexes

The dynamic chat system uses compound queries that require Firestore indexes to be created.

### 1. Chats Collection Index

**Collection:** `chats`
**Fields to index:**
- `participantIds` (Arrays)
- `isActive` (Ascending) 
- `lastActivity` (Descending)

**How to create:**
1. Go to Firebase Console > Firestore Database > Indexes
2. Click "Create Index"
3. Collection ID: `chats`
4. Add fields in this order:
   - Field: `participantIds`, Order: `Arrays`
   - Field: `isActive`, Order: `Ascending`
   - Field: `lastActivity`, Order: `Descending`

### 2. Users Collection Index

**Collection:** `users`
**Fields to index:**
- `petTypes` (Arrays)
- `lastSeen` (Descending)

**How to create:**
1. Go to Firebase Console > Firestore Database > Indexes
2. Click "Create Index" 
3. Collection ID: `users`
4. Add fields in this order:
   - Field: `petTypes`, Order: `Arrays`
   - Field: `lastSeen`, Order: `Descending`

## Required Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Allow reading other user profiles for discovery
    }
    
    // Chats collection
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        resource.data.participantIds.hasAny([request.auth.uid]);
      allow create: if request.auth != null &&
        request.resource.data.participantIds.hasAny([request.auth.uid]);
    }
    
    // Messages subcollection
    match /chats/{chatId}/messages/{messageId} {
      allow read, write: if request.auth != null;
      // Note: Should validate chat membership in production
    }
  }
}
```

## Common Error Messages

- **"requires an index"** → Create the compound indexes above
- **"permission denied"** → Update security rules 
- **"network error"** → Check internet connection and Firebase configuration

## Testing the Setup

1. Create a test user account
2. Try to access the chat list (should show empty state, not error)
3. Try user discovery (should load other users)
4. Create a chat between two users
5. Send messages in the chat
