import PageMeta from "../src/components/PageMeta";
import SiteHeader from "../src/components/SiteHeader";
import GuestLandingGate from "../src/components/GuestLandingGate";
import DeferredApp from "../src/components/DeferredApp";

export default function HomePage() {
  return (
    <>
      <PageMeta />
      <SiteHeader showThemeToggle withFooter>
        <div id="ssh-content">
          <GuestLandingGate />
          <DeferredApp shellMounted />
        </div>
      </SiteHeader>
    </>
  );
}
