export const CancelPage = () => {
  return (
    <div>
      <h1>Payment Cancelled</h1>
      <button
        className="PaymentReturn"
        onClick={() => {
          window.location.href = "https://www.soccerstatshub.com/";
        }}
      >
        Return to Soccer Stats Hub
      </button>
    </div>
  );
};
