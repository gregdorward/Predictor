import PageMeta from "../src/components/PageMeta";
import GuestLandingGate from "../src/components/GuestLandingGate";
import DeferredApp from "../src/components/DeferredApp";

export default function HomePage() {
  return (
    <>
      <PageMeta />
      <GuestLandingGate />
      <DeferredApp />
    </>
  );
}
