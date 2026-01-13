// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Support separate Firebase projects for development, staging, and production
const mode = (import.meta as any).env?.MODE || 'development';

// Helper to read env with fallback chain
const readEnv = (keys: string[], fallback?: string) => {
  for (const key of keys) {
    const val = (import.meta as any).env?.[key];
    if (val && String(val).trim() !== '') return val;
  }
  return fallback;
};

// Determine environment prefix based on mode
let envPrefix: string;
if (mode === 'production') {
  envPrefix = 'PROD';
} else if (mode === 'staging') {
  envPrefix = 'STAGING';
} else {
  envPrefix = 'DEV';
}

// Read config based on environment with fallback chain
const apiKey = readEnv([
  `VITE_${envPrefix}_FIREBASE_API_KEY`,
  'VITE_FIREBASE_API_KEY'
]);
const projectId = readEnv([
  `VITE_${envPrefix}_FIREBASE_PROJECT_ID`,
  'VITE_FIREBASE_PROJECT_ID'
]);
const messagingSenderId = readEnv([
  `VITE_${envPrefix}_FIREBASE_MESSAGING_SENDER_ID`,
  'VITE_FIREBASE_MESSAGING_SENDER_ID'
]);
const appId = readEnv([
  `VITE_${envPrefix}_FIREBASE_APP_ID`,
  'VITE_FIREBASE_APP_ID'
]);
const measurementId = readEnv([
  `VITE_${envPrefix}_FIREBASE_MEASUREMENT_ID`,
  'VITE_FIREBASE_MEASUREMENT_ID'
]);
const authDomain = readEnv([
  `VITE_${envPrefix}_FIREBASE_AUTH_DOMAIN`,
  'VITE_FIREBASE_AUTH_DOMAIN'
]);
let storageBucketEnv = readEnv([
  `VITE_${envPrefix}_FIREBASE_STORAGE_BUCKET`,
  'VITE_FIREBASE_STORAGE_BUCKET'
]) as string | undefined;

if (!apiKey || !projectId || !appId) {
  throw new Error('[Firebase] Missing required environment variables. Configure .env files for dev/prod Firebase projects.');
}

// Normalize bucket: enforce '<projectId>.appspot.com'
let normalizedBucket = `${projectId}.appspot.com`;
if (storageBucketEnv && storageBucketEnv.endsWith('.appspot.com')) {
  normalizedBucket = storageBucketEnv;
}

const firebaseConfig = {
  apiKey,
  authDomain: authDomain || `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket: normalizedBucket,
  messagingSenderId: messagingSenderId || "",
  appId,
  measurementId: measurementId || ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
// Only initialize analytics in the browser
export const analytics = (typeof window !== 'undefined') ? getAnalytics(app) : (undefined as any);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Optional: Use Firebase Emulators in local/dev to isolate from production
// Enable by setting VITE_USE_EMULATORS=true
const useEmulators = (import.meta as any).env?.VITE_USE_EMULATORS === 'true';
if (useEmulators) {
  try {
    // Firestore Emulator (default port 8080)
    connectFirestoreEmulator(db, '127.0.0.1', Number((import.meta as any).env?.VITE_FIRESTORE_EMULATOR_PORT) || 8080);
    // Auth Emulator (default port 9099)
    connectAuthEmulator(auth, `http://127.0.0.1:${(import.meta as any).env?.VITE_AUTH_EMULATOR_PORT || 9099}`);
    // Storage Emulator (default port 9199)
    connectStorageEmulator(storage, '127.0.0.1', Number((import.meta as any).env?.VITE_STORAGE_EMULATOR_PORT) || 9199);
    // eslint-disable-next-line no-console
    console.info('[Firebase] Using local emulators');
  } catch {
    // eslint-disable-next-line no-console
    console.warn('[Firebase] Failed to connect emulators; continuing with configured project');
  }
}

export default app;