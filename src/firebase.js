import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const isReactSnap =
  typeof navigator !== "undefined" && navigator.userAgent === "ReactSnap";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "react-snap-placeholder-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "localhost",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "react-snap",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "react-snap.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "0",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "react-snap",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = isReactSnap ? null : getAuth(app);
export const db = isReactSnap ? null : getFirestore(app);
