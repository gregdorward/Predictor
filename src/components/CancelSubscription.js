import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import PageMeta from "./PageMeta";
import Footer from "./Footer";

export default function CancelSubscription() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchSubscriptionStatus() {
      if (!auth || !db) return;

      // currentUser is null on a fresh page load until the persisted session is restored.
      await auth.authStateReady();
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          if (!cancelled) setIsPaidUser(data.isPaidUser || false);
        } else {
          console.error("User document not found in Firestore");
        }
      } catch (error) {
        console.error("Error fetching subscription status:", error);
      }
    }

    fetchSubscriptionStatus().finally(() => {
      if (!cancelled) setCheckingStatus(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCancelSubscription = async () => {
    setLoading(true);
    setMessage("");

    const user = auth?.currentUser;

    if (!auth || !user) {
      setMessage("User not authenticated.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_SERVER}cancel-subscription`, {
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
    <>
    <PageMeta />
    <div className="p-4 bg-white shadow-md rounded-lg">
      <a href="/" className="HomeLink">Home</a>
      <h1 className="text-xl font-semibold mb-2">Manage Subscription</h1>
      {checkingStatus ? (
        <p className="text-gray-500">Checking your subscription...</p>
      ) : isPaidUser ? (
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
    <Footer />
    </>
  );
}
