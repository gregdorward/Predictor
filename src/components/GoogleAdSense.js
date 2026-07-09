import { useEffect } from "react";
import { useShowGuestAds } from "../hooks/useShowGuestAds";

/** Hide Auto ads for paid subscribers; script stays in _document.js for AdSense verification. */
export default function GoogleAdSense() {
  const showAds = useShowGuestAds();

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return undefined;

    document.body.classList.toggle("ads-suppressed", !showAds);

    return () => {
      document.body.classList.remove("ads-suppressed");
    };
  }, [showAds]);

  return null;
}
