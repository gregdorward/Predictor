import { useEffect } from "react";
import Script from "next/script";
import { ADSENSE_CLIENT } from "../constants/adsense";
import { flushAdSenseAds } from "../utils/flushAdSenseAds";
import { startAutoAdsZoneExclusion } from "../utils/excludeAutoAdsZones";
import { useShowGuestAds } from "../hooks/useShowGuestAds";

export default function GoogleAdSenseScript() {
  const showGuestAds = useShowGuestAds();

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !showGuestAds) return undefined;
    return startAutoAdsZoneExclusion();
  }, [showGuestAds]);

  if (process.env.NODE_ENV !== "production" || !showGuestAds) {
    return null;
  }

  return (
    <Script
      id="google-adsense"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      onReady={flushAdSenseAds}
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
    />
  );
}
