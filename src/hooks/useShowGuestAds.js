import { useAuth } from "../logic/authProvider";

/** True for guests and logged-in free users; false while auth resolves or for subscribers. */
export function useShowGuestAds() {
  const { isPaidUser, loading, user } = useAuth();
  if (isPaidUser) return false;
  if (loading && user) return false;
  return true;
}
