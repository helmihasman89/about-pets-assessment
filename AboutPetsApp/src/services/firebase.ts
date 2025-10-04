import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

/**
 * Firebase Configuration and Initialization
 * 
 * Configures Firebase services for the chat app:
 * - Firebase Auth for user authentication
 * - Firestore for real-time chat data
 * - React Native persistence for auth state
 * 
 * NOTE: Replace with your actual Firebase config from Firebase Console
 */

const firebaseConfig = {
    apiKey: "AIzaSyD7vgxP6YUMH-KgYpQGIHR_-6V2cgieC_E",
    authDomain: "about-pets-8d9bc.firebaseapp.com",
    projectId: "about-pets-8d9bc",
    storageBucket: "about-pets-8d9bc.firebasestorage.app",
    messagingSenderId: "370379276773",
    appId: "1:370379276773:web:3804b85de5c2d3e0b3af0c",
    measurementId: "G-KBT6ML8YS7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Connect to Firestore emulator in development (optional)
if (__DEV__) {
  // Uncomment the line below to use Firestore emulator during development
  // connectFirestoreEmulator(db, 'localhost', 8080);
}

export { app, auth, db };