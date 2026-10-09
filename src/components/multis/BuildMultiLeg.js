import React from "react";

const scrollToFixture = (id) => {
  setTimeout(() => {
    const targetElement = document.getElementById(id);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, 0);
};

function outcomeStripeClass(outcome) {
  if (outcome === "Won") return "MultisHub__legOutcome--won";
  if (outcome === "Lost") return "MultisHub__legOutcome--lost";
  return "MultisHub__legOutcome--pending";
}

function legLinkClass(outcome) {
  if (outcome === "Won") return "MultisHub__legLink--won";
  if (outcome === "Lost") return "MultisHub__legLink--lost";
  return "";
}

export default function BuildMultiLeg({ tip }) {
  const teamsClass = `MultisHub__legTeams TipTeams${tip.outcome}`;
  const stripeClass = `MultisHub__legOutcome ${outcomeStripeClass(tip.outcome)}`;

  return (
    <li className="MultisHub__leg">
      <a
        href={`#${tip.id}`}
        className={`MultisHub__legLink ${legLinkClass(tip.outcome)}`.trim()}
        onClick={(e) => {
          e.preventDefault();
          scrollToFixture(tip.id);
        }}
      >
        <span className="MultisHub__legMeta">
          {tip.competition} · KO {tip.time}
        </span>
        <span className="MultisHub__legMain">
          <span className="MultisHub__legTeamsWrap">
            <span className={stripeClass} aria-hidden="true" />
            <span className={teamsClass}>
              <span className="TipHomeTeam MultisHub__legTeam">{tip.homeTeam}</span>
              {tip.status === "complete" ? (
                <span className="TipScore MultisHub__legScore">
                  {tip.homeGoals} – {tip.awayGoals}
                </span>
              ) : null}
              <span className="TipAwayTeam MultisHub__legTeam">{tip.awayTeam}</span>
            </span>
          </span>
          <span className="MultisHub__legPick">
            <span className="MultisHub__legPickLabel">{tip.team}</span>
            <span className="MultisHub__legResult">
              {tip.outcomeSymbol ? (
                <span
                  className={`MultisHub__legStatus ${tip.outcome || ""}`}
                  aria-hidden="true"
                >
                  {tip.outcomeSymbol}
                </span>
              ) : null}
              <span className="MultisHub__legOdds">{tip.odds}</span>
            </span>
          </span>
        </span>
      </a>
    </li>
  );
}
