import {
  formatProbabilityPercent,
  STAT_FALLBACK,
} from "../utils/formatStat";

function impliedProbability(decimalOdds) {
  if (!decimalOdds) return null;
  return (1 / decimalOdds) * 100;
}

function fairOdds(prob) {
  return prob > 0 ? 100 / prob : null;
}

function valueClass(value) {
  if (value > 2) return "value-positive";
  if (value < -2) return "value-negative";
  return "value-neutral";
}

const MARKET_ROWS = (match, homeWin, draw, awayWin, yes, no, over, under) => {
  const bttsYesImplied = impliedProbability(match.bttsOdds);
  const bttsNoImplied = bttsYesImplied != null ? 100 - bttsYesImplied : null;
  const over25Implied = impliedProbability(match.over25Odds);
  const under25Implied = over25Implied != null ? 100 - over25Implied : null;

  return [
    { label: "Home Win", model: homeWin, bookie: impliedProbability(match.homeOdds) },
    { label: "Away Win", model: awayWin, bookie: impliedProbability(match.awayOdds) },
    { label: "Draw", model: draw, bookie: impliedProbability(match.drawOdds) },
    { label: "BTTS - Yes", model: yes, bookie: bttsYesImplied },
    { label: "BTTS - No", model: no, bookie: bttsNoImplied },
    { label: "Over 2.5", model: over, bookie: over25Implied },
    { label: "Under 2.5", model: under, bookie: under25Implied },
  ];
};

export default function FixtureMarketValue({
  match,
  predictionUnlocked,
  unlockOrUpgrade,
  className = "",
  hideTitle = false,
}) {
  const homeWin = Number(match?.homeWinProbability);
  const draw = Number(match?.drawProbability);
  const awayWin = Number(match?.awayWinProbability);
  const yes = Number(match?.bttsYesProbability);
  const no = Number.isFinite(yes) ? 100 - yes : null;
  const over = Number(match?.over25Probability);
  const under = Number.isFinite(over) ? 100 - over : null;

  const rows = MARKET_ROWS(match, homeWin, draw, awayWin, yes, no, over, under);

  return (
    <section className={`FixturePage-marketValue ${className}`.trim()}>
      {hideTitle ? null : (
        <>
          <h3 className="FixturePage-statGroupTitle">Market value</h3>
          <p className="FixturePage-marketValueNote">
            Model probability versus bookmaker implied odds.
          </p>
        </>
      )}
      <table className="PredictionsTable FixturePage-marketValueTable">
        <thead>
          <tr>
            <th>Market</th>
            <th>Our probability</th>
            <th>Bookies probability</th>
            <th>Fair odds</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ label, model, bookie }) => {
            const modelValue = Number(model);
            const bookieValue = Number(bookie);
            const value =
              Number.isFinite(modelValue) && Number.isFinite(bookieValue)
                ? modelValue - bookieValue
                : null;
            const fairOddsValue = fairOdds(model);

            return (
              <tr key={label}>
                <td>{label}</td>
                <td>
                  {predictionUnlocked ? (
                    formatProbabilityPercent(model) || STAT_FALLBACK
                  ) : (
                    <button
                      type="button"
                      className="PredictionUnlockBtn PredictionUnlockBtn--inline"
                      onClick={unlockOrUpgrade}
                      aria-label="Unlock model probability"
                    >
                      🔒
                    </button>
                  )}
                </td>
                <td>{formatProbabilityPercent(bookie) || STAT_FALLBACK}</td>
                <td>
                  {predictionUnlocked && fairOddsValue != null
                    ? fairOddsValue.toFixed(2)
                    : predictionUnlocked
                      ? STAT_FALLBACK
                      : "—"}
                </td>
                <td className={valueClass(predictionUnlocked ? value : null)}>
                  {predictionUnlocked && Number.isFinite(value)
                    ? `${value.toFixed(1)}%`
                    : predictionUnlocked
                      ? STAT_FALLBACK
                      : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}