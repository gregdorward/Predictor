import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

// Lazy-load Stripe in the browser
let stripePromise = null;
const getStripe = () => {
  if (typeof window === "undefined") return null;
  if (!stripePromise) stripePromise = loadStripe("pk_live_51QojxLBrqiWlVPadBxhtoj499YzoC8YjFUIVQwCcTe8B7ZUG47NbYAam2wvNox2mUmzd0WgQh4PWKaIQaxKxubig00yEzjNuVQ");
  return stripePromise;
};

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [promoCode, setPromoCode] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    try {
      const response = await fetch("/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: "price_12345",
          uid: "user_uid_here",
          promoCode: promoCode.trim() || null,
        }),
      });

      const { id } = await response.json();
      if (id) {
        const { error } = await stripe.redirectToCheckout({ sessionId: id });
        if (error) console.error(error);
      }
    } catch (err) {
      console.error("Checkout error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <input
        type="text"
        placeholder="Enter promo code"
        value={promoCode}
        onChange={(e) => setPromoCode(e.target.value)}
        style={{ marginTop: "10px", padding: "5px" }}
      />
      <button type="submit" disabled={!stripe} style={{ marginTop: "10px" }}>
        Pay
      </button>
    </form>
  );
};

const PaymentPage = () => {
  const [stripeObj, setStripeObj] = useState(null);

  useEffect(() => {
    const s = getStripe();
    if (s) setStripeObj(s);
  }, []);

  if (!stripeObj) return null; // Render nothing during prerender

  return (
    <Elements stripe={stripeObj}>
      <CheckoutForm />
    </Elements>
  );
};

export default PaymentPage;
