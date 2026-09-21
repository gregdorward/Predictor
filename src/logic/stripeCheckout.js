import { loadStripe } from "@stripe/stripe-js";
import { getAuth } from "firebase/auth";
import { isReactSnap } from "../firebase";

let stripePromise = null;

const getStripe = () => {
  if (typeof window === "undefined" || isReactSnap) return null;
  if (!stripePromise) {
    stripePromise = loadStripe(
      "pk_live_51QojxLBrqiWlVPadBxhtoj499YzoC8YjFUIVQwCcTe8B7ZUG47NbYAam2wvNox2mUmzd0WgQh4PWKaIQaxKxubig00yEzjNuVQ"
    );
  }
  return stripePromise;
};

export { stripePromise };

export const handleCheckout = async (priceId, currency = "usd") => {
  const stripe = await getStripe();

  if (!stripe) {
    console.warn("Stripe not initialized. Are you prerendering?");
    return;
  }

  let user = null;
  if (typeof window !== "undefined") {
    user = getAuth().currentUser;
  }

  if (!user) {
    alert("Please sign-up or login before purchasing");
    return;
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_EXPRESS_SERVER}create-checkout-session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        priceId,
        uid: user.uid,
        currency: currency.toLowerCase(),
      }),
    }
  );

  const session = await response.json();
  const result = await stripe.redirectToCheckout({ sessionId: session.id });

  if (result.error) {
    console.error("Checkout error:", result.error.message);
  }
};
