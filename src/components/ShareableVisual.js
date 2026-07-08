import { useRef, useState } from "react";
import { Copy, Download, Share2 } from "lucide-react";
import {
  canShareImageFiles,
  captureCanvasAsPng,
  captureElementAsPng,
  copyImageDataUrl,
  downloadDataUrl,
  shareImageDataUrl,
} from "../utils/captureElementImage";
import { SITE_URL } from "../seo/pageMetaConfig";

export default function ShareableVisual({
  children,
  filename,
  shareTitle = "SoccerStatsHub stats",
  shareText = SITE_URL,
  className = "",
  captureClassName = "",
}) {
  const captureRef = useRef(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const showStatus = (message) => {
    setStatus(message);
    window.setTimeout(() => setStatus(""), 2500);
  };

  const captureImage = async () => {
    const root = captureRef.current;
    if (!root) {
      throw new Error("Capture area unavailable");
    }

    const brand = root.querySelector(".ShareableVisual__brand");
    const explicitTarget = root.querySelector("[data-share-capture]");
    const canvas = root.querySelector("canvas");

    if (canvas && !explicitTarget) {
      return captureCanvasAsPng(canvas, { brandElement: brand });
    }

    const target = explicitTarget || root;
    return captureElementAsPng(target, { brandElement: brand });
  };

  const runCaptureAction = async (action) => {
    if (busy) return;
    setBusy(true);
    try {
      await action();
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }
      console.error("Shareable visual capture failed:", error);
      showStatus("Image export failed");
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = () =>
    runCaptureAction(async () => {
      const dataUrl = await captureImage();
      downloadDataUrl(dataUrl, filename);
      showStatus("Downloaded!");
    });

  const handleCopy = () =>
    runCaptureAction(async () => {
      const dataUrl = await captureImage();
      const copied = await copyImageDataUrl(dataUrl);
      if (copied) {
        showStatus("Image copied!");
        return;
      }

      downloadDataUrl(dataUrl, filename);
      showStatus("Copy unavailable - downloaded instead");
    });

  const handleShare = () =>
    runCaptureAction(async () => {
      const dataUrl = await captureImage();
      if (!canShareImageFiles()) {
        const copied = await copyImageDataUrl(dataUrl);
        showStatus(copied ? "Image copied!" : "Share not supported");
        return;
      }
      const shared = await shareImageDataUrl(dataUrl, {
        filename,
        title: shareTitle,
        text: shareText,
      });
      showStatus(shared ? "Shared!" : "Share not supported");
    });

  return (
    <div className={`ShareableVisual ${className}`.trim()}>
      <div className="ShareableVisual__actions">
        <button
          type="button"
          className="ShareableVisual__btn"
          onClick={handleDownload}
          disabled={busy}
          aria-label="Download image"
          title="Download image"
        >
          <Download size={18} strokeWidth={2} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="ShareableVisual__btn"
          onClick={handleCopy}
          disabled={busy}
          aria-label="Copy image"
          title="Copy image"
        >
          <Copy size={18} strokeWidth={2} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="ShareableVisual__btn"
          onClick={handleShare}
          disabled={busy}
          aria-label="Share image"
          title="Share image"
        >
          <Share2 size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>

      <div
        ref={captureRef}
        className={`ShareableVisual__capture ${captureClassName}`.trim()}
      >
        {children}
        <div className="ShareableVisual__brand" aria-hidden="true">
          SoccerStatsHub · soccerstatshub.com
        </div>
      </div>

      {status ? (
        <p className="ShareableVisual__status" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
