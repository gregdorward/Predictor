import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";

// Sign Up
const signUp = async (email, password) => {
  await createUserWithEmailAndPassword(auth, email, password);
};

// Sign In
const signIn = async (email, password) => {
  await signInWithEmailAndPassword(auth, email, password);
};
