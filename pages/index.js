import PageMeta from "../src/components/PageMeta";
import GuestLandingGate from "../src/components/GuestLandingGate";
import DeferredApp from "../src/components/DeferredApp";
import { AuthProvider } from "../src/logic/authProvider";

export default function HomePage() {
  return (
    <AuthProvider>
      <PageMeta />
      <GuestLandingGate />
      <DeferredApp />
    </AuthProvider>
  );
}
