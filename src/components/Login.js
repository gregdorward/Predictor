import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Eye, EyeOff } from "lucide-react"; // Eye icons for toggling password visibility
import { auth, db } from "../firebase"; // Adjust the path as needed

export let userIsPaid = false;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
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
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleAuth} className="LoginForm">
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
            type={showPassword ? "text" : "password"} // Toggle between "text" and "password"
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
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button type="submit" className="LoginSignUp">
          {isLogin ? "Login" : "Sign Up"}
        </button>
        <button
          className="ResetPasswordLink"
          onClick={() => {
            window.location.href = "https://www.xgtipping.com/#/reset";
          }}
        >
          Reset password
        </button>
      </form>
      <button className="SignUp" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
      </button>
    </div>
  );
};

export default Login;
