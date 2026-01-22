import { signOut } from "firebase/auth";
import { auth } from "../firebase"; // Adjust path as needed
import { userIsPaid } from "./Login"; // Import your global variable

const handleLogout = async () => {
  try {
    await signOut(auth);
    
    // Reset your global state variable
    // Note: If userIsPaid is exported as 'let', you can reassign it here
    userIsPaid = false; 
    
    console.log("User signed out successfully");
    
    // Optional: Redirect user to home or login page
    // window.location.href = "/"; 
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

export default handleLogout