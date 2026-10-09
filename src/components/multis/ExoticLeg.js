import React from "react";

const scrollToFixture = (id) => {
  if (!id) return;
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 0);
};

export default function ExoticLeg({ tip }) {
  const outcomeClass =
    tip.outcome === "Won"
      ? "MultisHub__simpleLeg--won"
      : tip.outcome === "Lost"
        ? "MultisHub__simpleLeg--lost"
        : "";

  const fixtureId = tip.id ?? tip.gameId;

  return (
    <li className={`MultisHub__simpleLeg ${outcomeClass}`.trim()}>
      <a
        href={fixtureId ? `#${fixtureId}` : undefined}
        className="MultisHub__simpleLegLink"
        onClick={(e) => {
          if (!fixtureId) return;
          e.preventDefault();
          scrollToFixture(fixtureId);
        }}
      >
        <div className="MultisHub__simpleLegFixture">{tip.game}</div>
        <div className="MultisHub__simpleLegPick MultisHub__simpleLegPick--exotic">
          <span className="MultisHub__simpleLegSelection">{tip.team}</span>
          <span className="MultisHub__simpleLegResult">
            {tip.outcomeSymbol ? (
              <span
                className={`MultisHub__simpleLegStatus ${tip.outcome || ""}`}
                aria-hidden="true"
              >
                {tip.outcomeSymbol}
              </span>
            ) : null}
            <span className="MultisHub__simpleLegOdds">{tip.odds}</span>
          </span>
        </div>
      </a>
    </li>
  );
}
