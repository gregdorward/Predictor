import React from "react";

export const CancelPage = () => {
  return (
    <div>
      <h1>Payment Cancelled</h1>
      <button
        className="PaymentReturn"
        onClick={() => {
          window.location.href = "https://www.xgtipping.com/";
        }}
      >
        Return to XGTipping
      </button>
    </div>
  );
};
