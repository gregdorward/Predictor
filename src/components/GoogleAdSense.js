import { useEffect } from "react";
import { useShowGuestAds } from "../hooks/useShowGuestAds";

const ADSENSE_CLIENT = "ca-pub-2835838153738108";
const SCRIPT_ID = "ssh-adsense-script";

export default function GoogleAdSense() {
  const showAds = useShowGuestAds();

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return undefined;

    if (showAds) {
      document.body.classList.remove("ads-suppressed");

      if (document.getElementById(SCRIPT_ID)) {
        return undefined;
      }

      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);

      return undefined;
    }

    document.body.classList.add("ads-suppressed");
    document.getElementById(SCRIPT_ID)?.remove();

    return undefined;
  }, [showAds]);

  return null;
}
