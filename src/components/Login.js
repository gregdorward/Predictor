import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react"; // Eye icons for toggling password visibility
import { auth, db } from "../firebase"; // Adjust the path as needed

export let userIsPaid = false;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const capturedUsername = "randomUser123"; // Replace with actual username input value
  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        // await updateProfile(userCredential.user, {
        //   displayName: capturedUsername,
        // });
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Create Firestore user document with default isPaidUser set to false
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: userCredential.user.email,
          isPaidUser: false,
        });
      }

      // Fetch user subscription data from Firestore
      const userRef = doc(db, "users", userCredential.user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        // Update the global variable
        userIsPaid = data.isPaidUser;
        console.log("User isPaid status:", userIsPaid);
      } else {
        console.error("User document not found in Firestore");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <button className="SignUp" id="SignUp" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Switch to sign up form." : "Switch to login form"}
      </button>
      <div>We don't contact you or share your information with anyone</div>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* ⭐️ LoginForm: Main Flex Container ⭐️ */}
      <form onSubmit={handleAuth} className="LoginForm" id="LoginForm">

        {/* ⭐️ InputGroup: Groups and stacks the inputs on the left ⭐️ */}
        <div className="InputGroup" id="login-email-input">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="LoginInput1"
          />

          {/* Password Input with Toggle Button */}
          <div className="PasswordContainer">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="LoginInput2"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="TogglePasswordButton"
            >
              {/* Replace with your actual icon components */}
              {showPassword ? '👁️' : '🔒'}
            </button>
          </div>
        </div>

        {/* ⭐️ LoginSignUp: Submit button aligned to the right ⭐️ */}
        <button type="submit" className="LoginSignUp" id="LoginSignUp">
          {isLogin ? "Login" : "Sign Up"}
        </button>

        <button
          className="ResetPasswordLink"
          onClick={() => {
            window.location.href = "https://www.soccerstatshub.com/reset";
          }}
        >
          Reset password
        </button>
      </form>
    </div>
  );
};

export default Login;
