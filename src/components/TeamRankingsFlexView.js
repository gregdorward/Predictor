import RankingsSection from "../components/RankingsSection";
import { buildRankingsSections } from "../utils/rankingsInsights";

export default function TeamRankingsFlexView({
  title,
  ranksHome,
  ranksAway,
  teamALabel,
  teamBLabel,
  totalTeams,
}) {
  const sections = buildRankingsSections(ranksHome);

  return (
    <div className="rankings-wrapper">
      <div className="rankings-container">
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
    </div>
  );
}
