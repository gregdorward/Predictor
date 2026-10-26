import { useEffect, useRef, useState } from "react";
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
  lazy = true,
  className = "",
}) {
  const wrapperRef = useRef(null);
  const insRef = useRef(null);
  const [visible, setVisible] = useState(!lazy);
  const [hasWidth, setHasWidth] = useState(false);
  const attrs = VARIANT_ATTRS[variant] || VARIANT_ATTRS.display;

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return undefined;
    const measure = () => {
      // In-article units require at least 250px. Never insert an ins into a
      // hidden desktop rail: Google can otherwise consume its request at 0px.
      if (el.getBoundingClientRect().width >= 250) {
        // Keep an existing ad mounted through a resize; resizing must not
        // recreate an already requested placement.
        setHasWidth(true);
        flushAdSenseAds();
      }
    };
    measure();
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      return () => observer.disconnect();
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

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
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [lazy, visible]);

  useEffect(() => {
    if (!visible || !hasWidth || !slot) return undefined;
    const el = insRef.current;
    if (!el || el.getAttribute("data-adsbygoogle-status")) return undefined;
    flushAdSenseAds();
    return undefined;
  }, [visible, hasWidth, slot]);

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
      ref={wrapperRef}
      className={`AdSenseUnit AdSenseUnit--${variant} ${className}`.trim()}
      data-placement={placementId}
      aria-label="Advertisement"
    >
      {visible && hasWidth && slot ? <ins {...insProps} /> : null}
    </div>
  );
}
