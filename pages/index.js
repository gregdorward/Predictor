import dynamic from "next/dynamic";
import PageMeta from "../src/components/PageMeta";

// The homepage runs the imperative prediction engine, Firebase auth and Stripe,
// all of which are browser-only. Load it client-side after hydration.
const App = dynamic(() => import("../src/App"), {
  ssr: false,
  loading: () => (
    <div
      className="app-splash"
      role="status"
      aria-live="polite"
      aria-label="Loading Soccer Stats Hub"
    >
      <div className="app-splash__spinner" aria-hidden="true" />
      <p className="app-splash__text">Soccer Stats Hub</p>
    </div>
  ),
});

export default function HomePage() {
  return (
    <>
      <PageMeta />
      <App />
    </>
  );
}
