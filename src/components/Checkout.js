import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

const stripePromise = loadStripe("pk_live_51QojxLBrqiWlVPadBxhtoj499YzoC8YjFUIVQwCcTe8B7ZUG47NbYAam2wvNox2mUmzd0WgQh4PWKaIQaxKxubig00yEzjNuVQ");

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [promoCode, setPromoCode] = useState(""); // 🔹 State to store promo code

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    try {
      const response = await fetch("/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: "price_12345", // Replace with your actual Stripe price ID
          uid: "user_uid_here",  // Replace with actual user ID
          promoCode: promoCode.trim() || null, // 🔹 Send promo code if entered
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

const PaymentPage = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default PaymentPage;
