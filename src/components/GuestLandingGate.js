import { useEffect } from "react";
import { useAuth } from "../logic/authProvider";
import { requestAppLoad } from "../utils/loadApp";
import GuestLanding from "./GuestLanding";

export default function GuestLandingGate() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      requestAppLoad();
    }
  }, [loading, user]);

  if (!loading && user) {
    return null;
  }

  return <GuestLanding showLogin={!loading} />;
}
