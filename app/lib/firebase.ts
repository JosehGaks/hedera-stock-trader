'use client';

import { initializeApp, getApps, getApp, FirebaseOptions, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { firebaseConfig } from '../config/env';

// Log Firebase config (without sensitive data) for debugging
console.log('Firebase config:', {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? '[SET]' : '[NOT SET]'
});

// Check for valid Firebase config
const isValidConfig = (config: FirebaseOptions): boolean => {
  return Boolean(
    config.apiKey && 
    config.authDomain && 
    config.projectId
  );
};

// Initialize Firebase conditionally
let app: FirebaseApp | undefined = undefined;
let db: Firestore | undefined = undefined;
let auth: Auth | undefined = undefined;
let analytics: Analytics | undefined = undefined;

try {
  if (isValidConfig(firebaseConfig)) {
    // Use existing app if available, otherwise initialize new one
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    
    if (app) {
      // Initialize Firestore and Auth
      db = getFirestore(app);
      auth = getAuth(app);

      // Initialize Analytics conditionally (only in browser environment)
      if (typeof window !== 'undefined') {
        isSupported().then(yes => yes && (analytics = getAnalytics(app)));
      }
    }
  } else {
    console.warn('Invalid Firebase configuration. Firebase services will not be available.');
  }
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
}

export { app, db, auth, analytics }; 