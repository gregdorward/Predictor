import { useState } from "react";
import { copyToClipboard } from "../../utils/copyToClipboard";
import { formatStatsTipsShareText } from "../../utils/formatStatsTipsShareText";

export default function StatsTipsShare({ sectionId, tips }) {
  const [status, setStatus] = useState("");

  if (!tips?.length) {
    return null;
  }

  const showStatus = (message) => {
    setStatus(message);
    window.setTimeout(() => setStatus(""), 2500);
  };

  const handleCopyPlain = async () => {
    const text = formatStatsTipsShareText({
      sectionId,
      tips,
      format: "text",
    });
    const copied = await copyToClipboard(text);
    showStatus(copied ? "Copied plain text!" : "Copy failed");
  };

  const handleCopyMarkdown = async () => {
    const text = formatStatsTipsShareText({
      sectionId,
      tips,
      format: "markdown",
    });
    const copied = await copyToClipboard(text);
    showStatus(copied ? "Copied markdown table!" : "Copy failed");
  };

  return (
    <div className="MultisHub__statsShare">
      <div className="MultisHub__statsShareActions">
        <button
          type="button"
          className="CopyMultiButton"
          onClick={handleCopyPlain}
        >
          Copy plain text
        </button>
        <button
          type="button"
          className="CopyMultiButton"
          onClick={handleCopyMarkdown}
        >
          Markdown table
        </button>
      </div>
      {status ? (
        <p className="MultisHub__statsShareStatus" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
