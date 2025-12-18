import { useEffect, Fragment } from "react";

export const SuccessPage = () => {

    useEffect(() => {
    // Ensure gtag exists before calling it
    if (typeof window.gtag === "function") {
      window.gtag("event", "ads_conversion_Purchase_Page_load_http_1", {
        // event parameters here if needed
      });
    } else {
      console.warn("gtag is not loaded yet");
    }
  }, []);

  return (
    <Fragment>
      <h1>Payment Successful! Thank you for subscribing.</h1>
      <button
      className="PaymentReturn"
        onClick={() => {
          window.location.href = "https://www.soccerstatshub.com/";
        }}
      >
        Return to Soccer Stats Hub
      </button>
    </Fragment>
  );
};
