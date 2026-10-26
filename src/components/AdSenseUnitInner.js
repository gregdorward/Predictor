import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { ADSENSE_CLIENT } from "../constants/adsense";
import { flushAdSenseAds } from "../utils/flushAdSenseAds";

const VARIANT_ATTRS = {
  display: {
    style: { display: "block" },
    format: "auto",
    fullWidthResponsive: true,
  },
  inArticle: {
    style: { display: "block", textAlign: "center" },
    layout: "in-article",
    format: "fluid",
  },
  multiplex: {
    style: { display: "block" },
    format: "autorelaxed",
  },
};

/**
 * @param {object} props
 * @param {string} props.slot
 * @param {'display'|'inArticle'|'multiplex'} [props.variant]
 * @param {string} props.placementId
 * @param {boolean} [props.lazy]
 * @param {string} [props.className]
 */
export default function AdSenseUnitInner({
  slot,
  variant = "display",
  placementId,
  lazy = false,
  className = "",
}) {
  const router = useRouter();
  const wrapperRef = useRef(null);
  const insRef = useRef(null);
  const [visible, setVisible] = useState(!lazy);
  const attrs = VARIANT_ATTRS[variant] || VARIANT_ATTRS.display;
  const routeKey = `${router.asPath}-${placementId}`;

  useEffect(() => {
    if (!lazy || visible) return undefined;
    const el = wrapperRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [lazy, visible]);

  useEffect(() => {
    if (!visible || !slot) return undefined;
    const el = insRef.current;
    if (!el || el.getAttribute("data-adsbygoogle-status")) return undefined;
    flushAdSenseAds();
    return undefined;
  }, [visible, slot, router.asPath, placementId]);

  if (process.env.NODE_ENV !== "production") {
    return (
      <div
        className={`AdSenseUnit AdSenseUnit--dev ${className}`.trim()}
        data-placement={placementId}
        aria-hidden="true"
      />
    );
  }

  const insProps = {
    ref: insRef,
    className: "adsbygoogle",
    style: attrs.style,
    "data-ad-client": ADSENSE_CLIENT,
    "data-ad-slot": slot,
  };

  if (attrs.layout) insProps["data-ad-layout"] = attrs.layout;
  if (attrs.format) insProps["data-ad-format"] = attrs.format;
  if (attrs.fullWidthResponsive) {
    insProps["data-full-width-responsive"] = "true";
  }

  return (
    <div
      key={routeKey}
      ref={wrapperRef}
      className={`AdSenseUnit ${className}`.trim()}
      data-placement={placementId}
    >
      {visible ? <ins {...insProps} /> : null}
    </div>
  );
}
