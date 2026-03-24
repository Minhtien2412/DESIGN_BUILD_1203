import ENV from "@/config/env";
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: ENV.FIREBASE_API_KEY,
  authDomain: ENV.FIREBASE_AUTH_DOMAIN,
  projectId: ENV.FIREBASE_PROJECT_ID,
  storageBucket: ENV.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV.FIREBASE_MESSAGING_SENDER_ID,
  appId: ENV.FIREBASE_APP_ID,
};

function isFirebaseConfigPresent() {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
}

export const firebaseApp =
  getApps().length > 0
    ? getApps()[0]
    : isFirebaseConfigPresent()
      ? initializeApp(firebaseConfig)
      : null;

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;

export function assertFirebaseReady() {
  if (!firebaseAuth) {
    throw new Error(
      "Firebase chưa được cấu hình. Vui lòng set EXPO_PUBLIC_FIREBASE_* trong .env/app.config.ts",
    );
  }
  return firebaseAuth;
}