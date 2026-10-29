import { useAuth } from "../logic/authProvider";
import { isPremiumAdFreeCached } from "../utils/premiumAdFreeStorage";

/** True for guests and logged-in free users; false for subscribers or cached premium sessions. */
export function useShowGuestAds() {
  const { isPaidUser, loading, user } = useAuth();
  if (isPremiumAdFreeCached()) return false;
  if (isPaidUser) return false;
  if (loading && user) return false;
  return true;
}
