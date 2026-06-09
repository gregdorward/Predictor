import { formatWorldCupDate } from "../utils/worldCup2026Format";

function PredictionBar({ homeWin, draw, awayWin }) {
  return (
    <div className="WC26__predictionBar" aria-label="Match outcome probabilities">
      <div
        className="WC26__predictionSegment WC26__predictionSegment--home"
        style={{ flex: homeWin }}
      >
        <span>{homeWin}%</span>
      </div>
      <div
        className="WC26__predictionSegment WC26__predictionSegment--draw"
        style={{ flex: draw }}
      >
        <span>{draw}%</span>
      </div>
      <div
        className="WC26__predictionSegment WC26__predictionSegment--away"
        style={{ flex: awayWin }}
      >
        <span>{awayWin}%</span>
      </div>
    </div>
  );
}

/**
 * Single match row used in Key Matches tab (static or merged predictions).
 */
export default function WorldCup2026MatchCard({ match }) {
  const prediction = match.prediction;
  const badgeLabel = match.roundLabel || (match.group ? `Group ${match.group}` : match.phase);

  return (
    <div className="WC26__matchCard" data-match-id={match.id}>
      <div className="WC26__matchMeta">
        <span className="WC26__badge">{badgeLabel}</span>
        {match.date && (
          <span className="WC26__matchDate">{formatWorldCupDate(match.date)}</span>
        )}
        {match.source === "api" && (
          <span className="WC26__badge WC26__badge--live">Updated</span>
        )}
      </div>
      <div className="WC26__matchTeams">
        <span>{match.home}</span>
        {prediction?.predictedScore && (
          <span className="WC26__matchScore">{prediction.predictedScore}</span>
        )}
        <span>{match.away}</span>
      </div>
      {prediction?.homeWin != null && (
        <>
          <PredictionBar
            homeWin={prediction.homeWin}
            draw={prediction.draw}
            awayWin={prediction.awayWin}
          />
          <div className="WC26__predictionLabels">
            <span>Home</span>
            <span>Draw</span>
            <span>Away</span>
          </div>
        </>
      )}
    </div>
  );
}
