import { useState } from "react";
import { Share2 } from "lucide-react";
import { RedditIcon } from "react-share";
import { copyToClipboard } from "../utils/copyToClipboard";
import { formatFixtureComparisonText } from "../utils/formatFixtureComparisonText";

export default function FixtureComparisonShare({
  game,
  homeStats,
  awayStats,
  comparisonMap = {},
  rankings,
}) {
  const [status, setStatus] = useState("");

  if (!game || !homeStats || !awayStats) {
    return null;
  }

  const getFormattedText = (format) =>
    formatFixtureComparisonText({
      game,
      homeStats,
      awayStats,
      comparisonMap,
      rankings,
      format,
    });

  const showStatus = (message) => {
    setStatus(message);
    window.setTimeout(() => setStatus(""), 2500);
  };

  const shareTitle = `${game.homeTeam} vs ${game.awayTeam} - Soccer Stats Hub`;

  const handleShare = async () => {
    const text = getFormattedText("text");

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text,
        });
        showStatus("Shared!");
        return;
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }
      }
    }

    const copied = await copyToClipboard(text);
    showStatus(copied ? "Copied!" : "Copy failed");
  };

  const handleRedditShare = async () => {
    const text = getFormattedText("markdown");
    const title = `${game.homeTeam} vs ${game.awayTeam} - stat comparison`;

    await copyToClipboard(text);

    const redditUrl = `https://www.reddit.com/submit?title=${encodeURIComponent(
      title
    )}&text=${encodeURIComponent(text)}`;

    window.open(redditUrl, "_blank", "noopener,noreferrer");
    showStatus("Opening Reddit…");
  };

  return (
    <div className="FixtureComparisonShare">
      <div className="FixtureComparisonShare__actions">
        <button
          type="button"
          className="FixtureComparisonShare__btn"
          onClick={handleShare}
          aria-label="Share comparison"
          title="Share comparison"
        >
          <Share2 size={20} strokeWidth={2} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="FixtureComparisonShare__btn FixtureComparisonShare__btn--reddit"
          onClick={handleRedditShare}
          aria-label="Share via Reddit"
          title="Share via Reddit"
        >
          <RedditIcon size={32} round />
        </button>
      </div>
      {status ? (
        <p className="FixtureComparisonShare__status" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
