import { signOut } from "firebase/auth";
import { auth } from "../firebase"; // Adjust path as needed
import { setUserIsPaid } from "./Login"; // Import your global setter

const handleLogout = async () => {
  try {
    await signOut(auth);
    
    // Reset your global state variable
    setUserIsPaid(false); 
    
    console.log("User signed out successfully");
    
    // Optional: Redirect user to home or login page
    // window.location.href = "/"; 
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

export default handleLogout