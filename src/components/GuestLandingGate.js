import { useEffect, useState } from "react";
import { useAuth } from "../logic/authProvider";
import { MEMBERSHIP_LOGIN_PROMPT_EVENT } from "../logic/requestUpgrade";
import { requestAppLoad } from "../utils/loadApp";
import GuestLanding from "./GuestLanding";

function wantsMembershipFromUrl() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("upgrade") === "1";
}

export default function GuestLandingGate() {
  const { user, loading } = useAuth();
  const [showMembershipNotice, setShowMembershipNotice] = useState(false);

  useEffect(() => {
    if (loading || user) return undefined;

    const reveal = () => setShowMembershipNotice(true);
    if (wantsMembershipFromUrl()) reveal();

    window.addEventListener(MEMBERSHIP_LOGIN_PROMPT_EVENT, reveal);
    return () => window.removeEventListener(MEMBERSHIP_LOGIN_PROMPT_EVENT, reveal);
  }, [loading, user]);

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

  return (
    <GuestLanding
      showLogin={!loading}
      showMembershipNotice={showMembershipNotice}
    />
  );
}
