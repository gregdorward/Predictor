import { useAuth } from "../logic/authProvider";
import GuestLanding from "./GuestLanding";

export default function GuestLandingGate() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return null;
  }

  return <GuestLanding showLogin={!loading} />;
}
