import Script from "next/script";
import { ADSENSE_CLIENT } from "../constants/adsense";

export default function GoogleAdSenseScript() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <Script
      id="google-adsense"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
    />
  );
}
