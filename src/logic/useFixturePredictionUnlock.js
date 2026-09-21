import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./authProvider";
import {
  getRemainingFreeUnlocks,
  isFixturePredictionUnlocked,
  tryUnlockFixture,
} from "./freePredictionAllowance";
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
export function useFixturePredictionUnlock(fixtureId) {
  const { isPaidUser } = useAuth();
  const [unlocked, setUnlocked] = useState(() =>
    isFixturePredictionUnlocked(isPaidUser, fixtureId)
  );

  useEffect(() => {
    setUnlocked(isFixturePredictionUnlocked(isPaidUser, fixtureId));
  }, [isPaidUser, fixtureId]);

  useEffect(() => {
    const sync = () => {
      setUnlocked(isFixturePredictionUnlocked(isPaidUser, fixtureId));
    };
    window.addEventListener(PREDICTION_UNLOCK_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PREDICTION_UNLOCK_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [isPaidUser, fixtureId]);

  const unlockOrUpgrade = useCallback(() => {
    if (isFixturePredictionUnlocked(isPaidUser, fixtureId)) {
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
  }, [isPaidUser, fixtureId]);

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
