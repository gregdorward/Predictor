import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // Ensure you have Firebase initialized

export default function CancelSubscription() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isPaidUser, setIsPaidUser] = useState(false);

  useEffect(() => {
    async function fetchSubscriptionStatus() {
      const user = getAuth().currentUser;
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setIsPaidUser(data.isPaidUser || false);
        } else {
          console.error("User document not found in Firestore");
        }
      } catch (error) {
        console.error("Error fetching subscription status:", error);
      }
    }

    fetchSubscriptionStatus();
  }, []);

  const handleCancelSubscription = async () => {
    setLoading(true);
    setMessage("");

    const user = getAuth().currentUser;

    if (!user) {
      setMessage("User not authenticated.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}cancel-subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: user.uid }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Subscription cancellation scheduled.");
        setIsPaidUser(false);
      } else {
        setMessage(`⚠️ ${data.error || "Failed to cancel subscription."}`);
      }
    } catch (error) {
      setMessage("⚠️ Error cancelling subscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-2">Manage Subscription</h2>
      {isPaidUser ? (
        <>
          <p className="mb-2">Your subscription is active. Cancelations will come into effect after the end of your current billing cycle and are irreversible</p>
          <button
            onClick={handleCancelSubscription}
            className="bg-red-500 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Cancelling..." : "Cancel Subscription"}
          </button>
        </>
      ) : (
        <p className="text-gray-500">You do not have an active subscription.</p>
      )}
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
