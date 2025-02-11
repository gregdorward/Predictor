import React, { Fragment } from "react";

export const SuccessPage = () => {
  return (
    <Fragment>
      <h1>Payment Successful! Thank you for subscribing.</h1>
      <button
      className="PaymentReturn"
        onClick={() => {
          window.location.href = "https://www.xgtipping.com/";
        }}
      >
        Return to XGTipping
      </button>
    </Fragment>
  );
};
