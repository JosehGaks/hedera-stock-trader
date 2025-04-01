import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { env } from '../config/env';
import path from 'path';

// Initialize Firebase Admin
const apps = getApps();

if (!apps.length) {
  initializeApp({
    credential: cert(path.resolve(env.FIREBASE_SERVICE_ACCOUNT_PATH)),
  });
}

const adminDb = getFirestore();
const adminAuth = getAuth();

export { adminDb, adminAuth }; 