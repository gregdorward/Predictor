import dynamic from "next/dynamic";
import { useRouter } from "next/compat/router";
import { ADSENSE_SLOT_VARIANTS } from "../constants/adsense";
import { useShowGuestAds } from "../hooks/useShowGuestAds";

const AdSenseUnitInner = dynamic(() => import("./AdSenseUnitInner"), {
  ssr: false,
  loading: () => process.env.NODE_ENV === "production" ? (
    <div className="AdSenseUnit AdSenseUnit--placeholder" aria-hidden="true" />
  ) : null,
});

export default function AdSenseUnit(props) {
  const showGuestAds = useShowGuestAds();
  // Some legacy fixture views render in a separate React root without a router.
  const router = useRouter();
  const pathname = router?.asPath?.split(/[?#]/)[0] || "";
  const variant = ADSENSE_SLOT_VARIANTS[props.slot] || props.variant || "display";
  if (!showGuestAds) {
    return null;
  }
  // Reset both the DOM and lazy-loading state for a new page. Anchor jumps,
  // query changes and ordinary re-renders must not refresh existing ads.
  return (
    <AdSenseUnitInner
      key={`${pathname}:${props.slot}:${props.placementId}`}
      {...props}
      variant={variant}
    />
  );
}
