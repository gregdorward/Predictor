import { useState } from "react";
import { copyToClipboard } from "../utils/copyToClipboard";

export default function CopyMultiButton({ getText, label = "Copy to clipboard" }) {
  const [status, setStatus] = useState("idle");

  const handleCopy = async () => {
    const text = typeof getText === "function" ? getText() : "";
    if (!text) {
      setStatus("empty");
      return;
    }

    const copied = await copyToClipboard(text);
    setStatus(copied ? "copied" : "error");

    window.setTimeout(() => setStatus("idle"), 2500);
  };

  const statusLabel =
    status === "copied"
      ? "Copied!"
      : status === "error"
        ? "Copy failed"
        : status === "empty"
          ? "Nothing to copy"
          : null;

  return (
    <div className="CopyMultiActions">
      <button type="button" className="CopyMultiButton" onClick={handleCopy}>
        {label}
      </button>
      {statusLabel ? (
        <span className="CopyMultiButton__status" role="status">
          {statusLabel}
        </span>
      ) : null}
    </div>
  );
}
