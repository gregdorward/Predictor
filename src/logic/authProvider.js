import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  getFixturesEpoch,
  shouldApplyPredictionFixtures,
} from "./fixturesEpoch";

const AuthContext = createContext();

export let userDetail;
export let triggerGlobalPredictions;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fixtures, setFixtures] = useState([]);
  const [isPredicting, setIsPredicting] = useState(false);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      userDetail = currentUser;
      setLoading(false);

      if (currentUser && db) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const isPaid = userData.isPaidUser;
          currentUser.isPaid = isPaid;
          setIsPaidUser(isPaid === true);
        } else {
          console.log("User document does not exist in Firestore.");
          setIsPaidUser(false);
        }
      } else {
        setIsPaidUser(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGetPredictions = async (day) => {
    const epochAtStart = getFixturesEpoch();
    setIsPredicting(true);
    try {
      const { getScorePrediction } = await import("../logic/getScorePredictions");
      const data = await getScorePrediction(day);
      if (shouldApplyPredictionFixtures(epochAtStart)) {
        setFixtures(data);
      }
    } catch (error) {
      console.error("Prediction failed:", error);
    } finally {
      setIsPredicting(false);
    }
  };

  triggerGlobalPredictions = handleGetPredictions;

  return (
    <AuthContext.Provider
      value={{
        user,
        isPaidUser,
        loading,
        fixtures,
        setFixtures,
        handleGetPredictions,
        isPredicting,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
