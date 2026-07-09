import { useEffect, Fragment } from "react";
import PageMeta from "./PageMeta";
import Footer from "./Footer";

export const SuccessPage = () => {
  useEffect(() => {
    if (typeof window.gtag === "function") {
      window.gtag("event", "ads_conversion_Purchase_Page_load_http_1", {});
    } else {
      console.warn("gtag is not loaded yet");
    }
  }, []);

  return (
    <Fragment>
      <PageMeta />
      <h1>Payment Successful! Thank you for subscribing.</h1>
      <p>
        <a href="/" className="PaymentReturn">
          Return to Soccer Stats Hub
        </a>
      </p>
      <Footer />
    </Fragment>
  );
};
