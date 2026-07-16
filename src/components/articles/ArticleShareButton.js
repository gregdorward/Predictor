import { useCallback, useState } from "react";

function formatDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(`${String(dateStr).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ArticleShareButton({ title, text }) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const payload = {
      title: title || "Soccer Stats Hub",
      text: text || title || "",
      url,
    };

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(payload);
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled share or clipboard unavailable.
    }
  }, [text, title]);

  return (
    <button type="button" className="ArticleShare" onClick={handleShare}>
      {copied ? "Link copied" : "Share"}
    </button>
  );
}

export function ArticleDateLine({ publishedAt, updatedAt, dataAsOf, authorLabel }) {
  const published = formatDate(publishedAt);
  const asOf = formatDate(dataAsOf);
  const updated = formatDate(updatedAt);

  return (
    <p className="ArticleMeta">
      {authorLabel ? <span>{authorLabel}</span> : null}
      {published ? <span>Published {published}</span> : null}
      {asOf ? <span>Data as of {asOf}</span> : null}
      {updated && updated !== published ? <span>Updated {updated}</span> : null}
    </p>
  );
}
