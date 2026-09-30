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

  useEffect(() => {
    if (loading || user) {
      return undefined;
    }

    const startPrefetch = () => requestAppLoad();
    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(startPrefetch, { timeout: 2000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(startPrefetch, 400);
    return () => window.clearTimeout(timeoutId);
  }, [loading, user]);

  if (!loading && user) {
    return null;
  }

  return <GuestLanding showLogin={!loading} />;
}
