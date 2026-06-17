import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

/**
 * Returns a promise that resolves to the current user if logged in,
 * or null if not logged in.
 */
export async function getCurrentUser() {
  if (!auth) return null;

  return new Promise((resolve, reject) => {
    // Use onAuthStateChanged to get the current user once
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );
  });
}
