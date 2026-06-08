import { useState } from "react";
import { copyToClipboard } from "../utils/copyToClipboard";
import {
  formatFixtureComparisonText,
  SHARE_COMPARISON_STATS,
} from "../utils/formatFixtureComparisonText";

function formatStatValue(value) {
  if (value == null || value === "" || value === "-") {
    return "—";
  }
  return String(value);
}

function ComparisonStatRow({ label, homeValue, awayValue, edge }) {
  const homeClass =
    edge === "better" ? "FixtureComparisonShare__value--better" : "";
  const awayClass =
    edge === "worse" ? "FixtureComparisonShare__value--better" : "";

  return (
    <div className="FixtureComparisonShare__row">
      <span className={`FixtureComparisonShare__value FixtureComparisonShare__value--home ${homeClass}`}>
        {formatStatValue(homeValue)}
      </span>
      <span className="FixtureComparisonShare__label">{label}</span>
      <span className={`FixtureComparisonShare__value FixtureComparisonShare__value--away ${awayClass}`}>
        {formatStatValue(awayValue)}
      </span>
    </div>
  );
}

export default function FixtureComparisonShare({
  game,
  homeStats,
  awayStats,
  comparisonMap = {},
}) {
  const [status, setStatus] = useState("idle");

  if (!game || !homeStats || !awayStats) {
    return null;
  }

  const visibleStats = SHARE_COMPARISON_STATS.filter(({ key }) => {
    const homeValue = formatStatValue(homeStats[key]);
    const awayValue = formatStatValue(awayStats[key]);
    return homeValue !== "—" || awayValue !== "—";
  });

  if (!visibleStats.length) {
    return null;
  }

  const handleCopy = async () => {
    const text = formatFixtureComparisonText({
      game,
      homeStats,
      awayStats,
      comparisonMap,
    });
    const copied = await copyToClipboard(text);
    setStatus(copied ? "copied" : "error");
    window.setTimeout(() => setStatus("idle"), 2500);
  };

  const prediction =
    game.goalsA != null && game.goalsB != null
      ? `${game.goalsA}–${game.goalsB}`
      : null;

  return (
    <section className="FixtureComparisonShare">
      <div className="FixtureComparisonShare__header">
        <h3 className="FixtureComparisonShare__title">Share this comparison</h3>
        <p className="FixtureComparisonShare__subtitle">
          Copy a stats snapshot for WhatsApp, Telegram, or social posts.
        </p>
        <button type="button" className="CopyMultiButton" onClick={handleCopy}>
          Copy comparison
        </button>
        {status === "copied" ? (
          <p className="CopyMultiButton__status" role="status">
            Comparison copied!
          </p>
        ) : null}
        {status === "error" ? (
          <p className="CopyMultiButton__status CopyMultiButton__status--error" role="status">
            Copy failed
          </p>
        ) : null}
      </div>

      <div className="FixtureComparisonShare__card" id={`comparison-share-${game.id}`}>
        <div className="FixtureComparisonShare__match">
          <span className="FixtureComparisonShare__team">{game.homeTeam}</span>
          <span className="FixtureComparisonShare__vs">v</span>
          <span className="FixtureComparisonShare__team">{game.awayTeam}</span>
        </div>

        {game.leagueDesc ? (
          <p className="FixtureComparisonShare__meta">{game.leagueDesc}</p>
        ) : null}

        {prediction ? (
          <p className="FixtureComparisonShare__prediction">
            SSH Prediction: <strong>{prediction}</strong>
          </p>
        ) : null}

        <div className="FixtureComparisonShare__columns">
          <span>{homeStats.name || game.homeTeam}</span>
          <span>Stat</span>
          <span>{awayStats.name || game.awayTeam}</span>
        </div>

        <div className="FixtureComparisonShare__rows">
          {visibleStats.map(({ key, label }) => (
            <ComparisonStatRow
              key={key}
              label={label}
              homeValue={homeStats[key]}
              awayValue={awayStats[key]}
              edge={comparisonMap[key]}
            />
          ))}
        </div>

        <p className="FixtureComparisonShare__brand">soccerstatshub.com</p>
      </div>
    </section>
  );
}
