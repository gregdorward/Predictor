import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { ThreeDots } from "react-loading-icons";

const AuthContext = createContext();

export let userDetail;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      userDetail = currentUser;

      if (currentUser) {
        // Check Firestore for subscription status using currentUser.email or uid
        // (Adjust the document reference as needed)
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();

          const isPaid = userData.isPaidUser;
          currentUser.isPaid = isPaid
          if (isPaid === true) {
            setIsPaidUser(isPaid === true);
            console.log(isPaid)
          } else {
            setIsPaidUser(false);
          }
        } else {
          console.log("User document does not exist in Firestore.");
          setIsPaidUser(false);
        }
      }

      setLoading(false); // Auth state has been determined
    });

    return () => unsubscribe();
  }, []);

  // Until loading is complete, return a loading indicator (or null)
  if (loading) {
    return <ThreeDots className="MainLoading"/>;
  }

  return (
    <AuthContext.Provider value={{ user, isPaidUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to access authentication data
export const useAuth = () => useContext(AuthContext);
