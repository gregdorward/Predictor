import { useState } from "react";
import { Share2 } from "lucide-react";
import { copyToClipboard } from "../utils/copyToClipboard";

/**
 * Share the current page URL via the OS share sheet when available,
 * otherwise copy it from the address bar to the clipboard.
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
    const url =
      typeof window !== "undefined"
        ? window.location.href.split("#")[0]
        : "";
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
