import CopyMultiButton from "./CopyMultiButton";
import { formatFixtureComparisonText } from "../utils/formatFixtureComparisonText";

export default function FixtureComparisonShare({
  game,
  homeStats,
  awayStats,
  comparisonMap = {},
}) {
  if (!game || !homeStats || !awayStats) {
    return null;
  }

  const getFormattedText = (format) =>
    formatFixtureComparisonText({
      game,
      homeStats,
      awayStats,
      comparisonMap,
      format,
    });

  return (
    <div className="FixtureComparisonShare">
      <div className="CopyMultiActions">
        <CopyMultiButton label="Copy as text" getText={() => getFormattedText("text")} />
        <CopyMultiButton
          label="Copy as markdown"
          getText={() => getFormattedText("markdown")}
        />
      </div>
      <p className="FixtureComparisonShare__hint">
        Markdown works on Reddit posts and many forums. Winners are bold in markdown, marked with ✓ in plain text.
      </p>
    </div>
  );
}
