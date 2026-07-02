import PageMeta from "./PageMeta";
import Footer from "./Footer";

export const CancelPage = () => {
  return (
    <div>
      <PageMeta />
      <h1>Payment Cancelled</h1>
      <p>
        <a href="/" className="PaymentReturn">
          Return to SoccerStatsHub
        </a>
      </p>
      <Footer />
    </div>
  );
};
