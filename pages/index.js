import { useState } from "react";
import PageMeta from "../src/components/PageMeta";
import SiteHeader from "../src/components/SiteHeader";
import GuestLandingGate from "../src/components/GuestLandingGate";
import DeferredApp from "../src/components/DeferredApp";

export default function HomePage() {
  const [landingVisible, setLandingVisible] = useState(true);

  return (
    <>
      <PageMeta />
      <SiteHeader showThemeToggle />
      {landingVisible ? <GuestLandingGate /> : null}
      <DeferredApp shellMounted onAppReady={() => setLandingVisible(false)} />
    </>
  );
}
