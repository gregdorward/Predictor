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

/**
 * Share the current page URL via the OS share sheet when available,
 * otherwise copy the canonical page link to the clipboard.
 */
export default function SharePageLinkButton({
  title = "Soccer Stats Hub",
  text = "",
  className = "",
  label = "Share link",
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

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
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
          return;
        }
      }
    }

    const copied = await copyToClipboard(url);
    showStatus(copied ? "Link copied!" : "Copy failed");
  };

  return (
    <div className={`SharePageLink ${className}`.trim()}>
      <button
        type="button"
        className="SharePageLink__btn"
        onClick={handleShare}
        aria-label={label}
        title={label}
      >
        <Share2 size={16} strokeWidth={2} aria-hidden="true" />
        <span>{status || label}</span>
      </button>
    </div>
  );
}
