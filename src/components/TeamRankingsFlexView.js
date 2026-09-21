import RankingsSection from "../components/RankingsSection";
import ShareableVisual from "./ShareableVisual";
import PremiumBlurGate from "./PremiumBlurGate";
import { buildRankingsSections } from "../utils/rankingsInsights";
import { sanitizeImageFilename } from "../utils/captureElementImage";

export default function TeamRankingsFlexView({
  title,
  ranksHome,
  ranksAway,
  teamALabel,
  teamBLabel,
  totalTeams,
  shareFilename,
  shareTitle,
  locked = false,
}) {
  const sections = buildRankingsSections(ranksHome);
  const filename =
    shareFilename ||
    sanitizeImageFilename(`${teamALabel}-vs-${teamBLabel}-rankings`);
  const visualTitle =
    shareTitle || `${teamALabel} vs ${teamBLabel} - league rankings`;

  return (
    <PremiumBlurGate locked={locked}>
      <ShareableVisual
        filename={filename}
        shareTitle={visualTitle}
        className={`rankings-wrapper${locked ? " rankings-wrapper--locked" : ""}`}
        hideActions={locked}
      >
        <div
          {...(!locked ? { "data-share-capture": true } : {})}
          className={`rankings-container${locked ? " blurred" : ""}`}
        >
          <h4 className="rankings-title">{title}</h4>

          <div className="Rankings-legend">
            <span className="Rankings-legendItem">
              <span
                className="Rankings-legendSwatch Rankings-legendSwatch--home"
                aria-hidden="true"
              />
              {teamALabel}
            </span>
            <span className="Rankings-legendItem">
              <span
                className="Rankings-legendSwatch Rankings-legendSwatch--away"
                aria-hidden="true"
              />
              {teamBLabel}
            </span>
          </div>

          {sections.map((section) => (
            <RankingsSection
              key={section.title}
              title={section.title}
              metrics={section.metrics}
              ranksHome={ranksHome}
              ranksAway={ranksAway}
              teamALabel={teamALabel}
              teamBLabel={teamBLabel}
              totalTeams={totalTeams}
            />
          ))}
        </div>
      </ShareableVisual>
    </PremiumBlurGate>
  );
}
