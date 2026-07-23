import { useState } from "react";
import { Share2 } from "lucide-react";
import { copyToClipboard } from "../utils/copyToClipboard";

function getShareablePageUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  // Drop query params (e.g. ?theme=dark) and hash so shared links stay clean.
  const { origin, pathname } = window.location;
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return `${origin}${path}`;
}

function shouldUseNativeShare() {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }

  // Desktop share sheets (especially macOS) often lack a useful Copy Link
  // action, so keep native share for touch / coarse-pointer devices only.
  const coarsePointer =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
  const hasTouch = (navigator.maxTouchPoints || 0) > 0;
  return coarsePointer || hasTouch;
}

/**
 * Copy the current page URL to the clipboard. On touch devices, also open
 * the OS share sheet when available.
 */
export default function SharePageLinkButton({
  title = "Soccer Stats Hub",
  text = "",
  className = "",
  label = "Share match link",
}) {
  const [status, setStatus] = useState("");

  const showStatus = (message) => {
    setStatus(message);
    window.setTimeout(() => setStatus(""), 2500);
  };

  const handleShare = async () => {
    const url = getShareablePageUrl();
    if (!url) {
      showStatus("Link unavailable");
      return;
    }

    const copied = await copyToClipboard(url);

    if (shouldUseNativeShare()) {
      try {
        await navigator.share({
          title,
          text: text || title,
          url,
        });
        showStatus("Shared!");
        return;
      } catch (error) {
        if (error?.name === "AbortError") {
          showStatus(copied ? "Link copied!" : "Copy failed");
          return;
        }
      }
    }

    showStatus(copied ? "Link copied!" : "Copy failed");
  };

  return (
    <div className={`SharePageLink ${className}`.trim()}>
      <button
        type="button"
        className="SharePageLink__btn"
        onClick={handleShare}
        aria-label={label}
        title="Copy match link"
      >
        <Share2 size={16} strokeWidth={2} aria-hidden="true" />
        <span>{status || label}</span>
      </button>
    </div>
  );
}
