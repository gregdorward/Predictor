import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// True during any non-browser render pass: Next.js server/static-export build
// (no `window`) or the legacy react-snap prerender user agent. The existing
// `if (isReactSnap) return;` guards rely on this to skip browser-only work.
export const isReactSnap =
  typeof window === "undefined" ||
  (typeof navigator !== "undefined" && navigator.userAgent === "ReactSnap");

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "react-snap-placeholder-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "localhost",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "react-snap",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "react-snap.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "0",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "react-snap",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = isReactSnap ? null : initializeApp(firebaseConfig);

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
