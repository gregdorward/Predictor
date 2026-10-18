import { useEffect, useRef, useState } from "react";
import { copyToClipboard } from "../../utils/copyToClipboard";
import { formatStatsTipsShareText } from "../../utils/formatStatsTipsShareText";
import StatsTipsShareCard from "./StatsTipsShareCard";

export default function StatsTipsShare({ sectionId, tips }) {
  const [status, setStatus] = useState("");
  const [cardOpen, setCardOpen] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    setCardOpen(false);
  }, [sectionId]);

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

  const handleOpenShareCard = () => {
    setCardOpen(true);
    window.setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 0);
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
        <button
          type="button"
          className="CopyMultiButton"
          onClick={handleOpenShareCard}
        >
          Share card
        </button>
      </div>
      {cardOpen ? (
        <div ref={cardRef} className="MultisHub__statsShareCardWrap">
          <StatsTipsShareCard sectionId={sectionId} tips={tips} />
        </div>
      ) : null}
      {status ? (
        <p className="MultisHub__statsShareStatus" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
