# Real-Time Chat App

A React Native chat application built with Expo and TypeScript, featuring real-time messaging, user authentication, and local storage.

## 🚀 Features

- **Real-time messaging** with Firebase Firestore
- **User authentication** with Firebase Auth
- **Local storage** with MMKV for offline support
- **Modern UI** with reusable components
- **TypeScript** for type safety
- **Cross-platform** support (iOS, Android, Web)

## 📁 Project Structure

```
src/
├── auth/                   # Authentication module
│   ├── components/         # Login, Register forms
│   └── hooks/             # useAuth hook
├── chat/                   # Chat module
│   ├── components/         # ChatList, ChatRoom, MessageBubble
│   └── hooks/             # useChatList, useMessages, useSendMessage
├── components/             # Reusable UI components
│   └── ui/                # Button, Input, Avatar, etc.
├── services/               # External services
│   ├── firebase.ts        # Firebase configuration
│   └── chatService.ts     # Chat operations
├── storage/                # Local storage
│   ├── mmkv.ts           # MMKV configuration
│   └── storageService.ts  # Storage operations
├── types/                  # TypeScript definitions
├── utils/                  # Helper functions
├── navigation/             # Navigation configuration
└── screens/               # Screen components
```

## 🛠 Setup Instructions

### Prerequisites

- Node.js (16+)
- npm or yarn
- Expo CLI
- Firebase project

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd AboutPetsApp
   npm install
   ```

2. **Configure Firebase:**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Copy your Firebase config to `src/services/firebase.ts`

3. **Install additional dependencies:**
   ```bash
   # Core navigation and UI
   npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
   npm install react-native-screens react-native-safe-area-context
   
   # Firebase
   npm install firebase
   
   # Storage
   npm install react-native-mmkv
   
   # AsyncStorage for auth persistence
   npm install @react-native-async-storage/async-storage
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

## 📱 Key Components

### Authentication
- `LoginForm` - User login with email/password
- `RegisterForm` - User registration
- `useAuth` - Authentication state management

### Chat
- `ChatList` - List of user's conversations
- `ChatRoom` - Individual chat interface
- `MessageBubble` - Individual message display

### Storage
- `storageService` - Unified storage interface
- `mmkv` - High-performance local storage

### UI Components
- `Button` - Reusable button with variants
- `Input` - Form input with validation
- `Avatar` - User profile pictures
- `LoadingSpinner` - Loading indicators

## 🔥 Firebase Setup

### Firestore Collections Structure

```
chats/
├── {chatId}/
│   ├── name: string
│   ├── participantIds: string[]
│   ├── createdAt: timestamp
│   ├── lastMessage: object
│   └── messages/
│       └── {messageId}/
│           ├── text: string
│           ├── senderId: string
│           ├── timestamp: timestamp
│           └── senderName: string

users/ (optional)
└── {userId}/
    ├── displayName: string
    ├── email: string
    └── photoURL: string
```

### Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Chat access for participants only
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participantIds;
      
      match /messages/{messageId} {
        allow read, write: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participantIds;
      }
    }
  }
}
```

## 🚦 Running the App

```bash
# Start Metro bundler
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

## 📦 Build for Production

```bash
# Create production build
expo build:android
expo build:ios

# Or use EAS Build (recommended)
eas build --platform android
eas build --platform ios
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run linting
npm run lint
```

## 📚 Tech Stack

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **TypeScript** - Type safety and better DX
- **Firebase** - Backend services (Auth, Firestore)
- **React Navigation** - Navigation library
- **MMKV** - High-performance local storage
- **Expo Vector Icons** - Icon library

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.