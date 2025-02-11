import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export async function checkUserPaidStatus(uid) {
  if (!uid) throw new Error("User UID is required");

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data().isPaidUser;
  } else {
    return false;
  }
}
