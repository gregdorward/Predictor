export const PREMIUM_AD_FREE_STORAGE_KEY = "ssh-premium-ad-free";

export function isPremiumAdFreeCached() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(PREMIUM_AD_FREE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setPremiumAdFreeCached() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREMIUM_AD_FREE_STORAGE_KEY, "1");
  } catch {
    // Ignore private mode / quota errors.
  }
}

export function clearPremiumAdFreeCached() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PREMIUM_AD_FREE_STORAGE_KEY);
  } catch {
    // Ignore private mode errors.
  }
}
