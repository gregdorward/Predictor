import { Fragment } from "react";

export const SuccessPage = () => {
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
