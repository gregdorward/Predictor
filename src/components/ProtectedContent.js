import { getAuth, onAuthStateChanged } from "firebase/auth";

/**
 * Returns a promise that resolves to the current user if logged in,
 * or null if not logged in.
 */
export async function getCurrentUser() {
  const auth = getAuth();
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
