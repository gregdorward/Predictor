import { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const auth = getAuth();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleReset}>
        <input
          type="email"
          className="ResetPasswordField"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Email</button>
      </form>
    </div>
  );
};

export default PasswordReset;
