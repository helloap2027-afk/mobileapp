import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBPvGYh3ft0HpGQLWaet8xVuWrfUS7dE_A",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "hello-hi-93d5c.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "hello-hi-93d5c",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "hello-hi-93d5c.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "26940861461",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:26940861461:web:6bbea2287380fe604df21c",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-QJ2X0SDMR2",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Google Auth Provider with Web Client ID for proper OAuth2 token exchange
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("profile");
googleProvider.addScope("email");
googleProvider.setCustomParameters({
  client_id:
    process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    "26940861461-0titlq9g2h5k8e4fii9nva7aavat8jbk.apps.googleusercontent.com",
  prompt: "select_account",
});
