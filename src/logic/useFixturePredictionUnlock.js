import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./authProvider";
import {
  getRemainingFreeUnlocks,
  tryUnlockFixture,
} from "./freePredictionAllowance";
import { hasFixtureFullAccess } from "./featuredFreeFixture";
import { requestUpgrade } from "./requestUpgrade";

export const PREDICTION_UNLOCK_EVENT = "ssh-prediction-unlock";

export function notifyPredictionUnlock() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PREDICTION_UNLOCK_EVENT));
}

/**
 * Shared unlock state for predicted score / 1X2 on a fixture.
 * Score mode and probability mode share the same allowance.
 */
export function useFixturePredictionUnlock(fixtureId, featuredFixtureId = null) {
  const { isPaidUser } = useAuth();
  const resolveUnlocked = () =>
    hasFixtureFullAccess(isPaidUser, fixtureId, featuredFixtureId);

  const [unlocked, setUnlocked] = useState(() => resolveUnlocked());

  useEffect(() => {
    setUnlocked(resolveUnlocked());
  }, [isPaidUser, fixtureId, featuredFixtureId]);

  useEffect(() => {
    const sync = () => {
      setUnlocked(resolveUnlocked());
    };
    window.addEventListener(PREDICTION_UNLOCK_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PREDICTION_UNLOCK_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [isPaidUser, fixtureId, featuredFixtureId]);

  const unlockOrUpgrade = useCallback(() => {
    if (hasFixtureFullAccess(isPaidUser, fixtureId, featuredFixtureId)) {
      setUnlocked(true);
      return true;
    }
    const result = tryUnlockFixture(isPaidUser, fixtureId);
    if (result.unlocked) {
      setUnlocked(true);
      notifyPredictionUnlock();
      return true;
    }
    requestUpgrade();
    return false;
  }, [isPaidUser, fixtureId, featuredFixtureId]);

  return { unlocked, unlockOrUpgrade, isPaidUser };
}

/**
 * Remaining free unlocks for the premium banner / remaining count.
 */
export function useRemainingFreeUnlocks() {
  const { isPaidUser } = useAuth();
  const [remaining, setRemaining] = useState(() =>
    getRemainingFreeUnlocks(isPaidUser)
  );

  useEffect(() => {
    const sync = () => setRemaining(getRemainingFreeUnlocks(isPaidUser));
    sync();
    window.addEventListener(PREDICTION_UNLOCK_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PREDICTION_UNLOCK_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [isPaidUser]);

  return { remaining, isPaidUser };
}
