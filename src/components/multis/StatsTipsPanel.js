import React, { useState } from "react";
import { requestUpgrade } from "../../logic/requestUpgrade";

const scrollToFixture = (id) => {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
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

function StatsTipLeg({ tip }) {
  const stripeClass = `MultisHub__legOutcome ${outcomeStripeClass(tip.outcome)}`;

  return (
    <li className="MultisHub__leg MultisHub__leg--stats">
      <a
        href={`#${tip.id}`}
        className={`MultisHub__legLink ${legLinkClass(tip.outcome)}`.trim()}
        onClick={(e) => {
          e.preventDefault();
          scrollToFixture(tip.id);
        }}
      >
        <span className="MultisHub__legMain MultisHub__legMain--stats">
          <span className="MultisHub__legTeamsWrap MultisHub__legTeamsWrap--stats">
            <span className={stripeClass} aria-hidden="true" />
            <span className="MultisHub__legTextStack MultisHub__legTextStack--stats">
              <span className="MultisHub__legFixtureLine">{tip.game}</span>
              <span className="MultisHub__legPickLabel">{tip.prediction}</span>
            </span>
          </span>
          <span className="MultisHub__legResult MultisHub__legResult--stats">
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
      </a>
    </li>
  );
}

function TipList({ tips, paid, freeLimit = 2 }) {
  if (!tips || tips.length === 0) {
    return (
      <p className="MultisHub__empty">No fixtures match these stats today.</p>
    );
  }

  const visible = paid ? tips : tips.slice(0, freeLimit);
  const hidden = tips.length - visible.length;

  return (
    <>
      <ul className="MultisHub__legList MultisHub__legList--stats">
        {visible.map((tip) => (
          <StatsTipLeg key={tip.id || tip.game} tip={tip} />
        ))}
      </ul>
      {!paid && hidden > 0 ? (
        <button
          type="button"
          className="MultisHub__upgrade UnlockBanner"
          onClick={() => requestUpgrade()}
        >
          Upgrade for {hidden} more tips
        </button>
      ) : null}
    </>
  );
}

const SECTIONS = [
  { id: "xg", label: "xG diff", description: "Largest xG differentials (last 5)" },
  { id: "points", label: "Points", description: "Largest points-per-game differentials (last 6)" },
  { id: "goals", label: "Goals", description: "Largest goal differentials (last 5)" },
  { id: "attacks", label: "Attacks", description: "Largest dangerous-attacks differentials (last 5)" },
  { id: "sot", label: "SOT", description: "Largest shots-on-target differentials (last 5)" },
];

export default function StatsTipsPanel({
  paid,
  xgTips,
  pointsTips,
  rollingTips,
  attacksTips,
  sotTips,
}) {
  const [activeId, setActiveId] = useState("xg");

  const dataById = {
    xg: xgTips,
    points: pointsTips,
    goals: rollingTips,
    attacks: attacksTips,
    sot: sotTips,
  };

  const active = SECTIONS.find((s) => s.id === activeId) || SECTIONS[0];

  return (
    <div className="MultisHub__statsPanel">
      <div role="tabpanel" className="MultisHub__statsPanelBody">
        <p className="MultisHub__sectionLede">
          Tips from stat differentials for today&apos;s fixtures. Select a fixture to open its match
          card.
        </p>
        <div className="MultisHub__carouselTabs" role="tablist" aria-label="Stats tip categories">
          {SECTIONS.map((section) => {
            const selected = section.id === activeId;
            return (
              <button
                key={section.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`MultisHub__carouselTab${selected ? " MultisHub__carouselTab--active" : ""}`}
                onClick={() => setActiveId(section.id)}
              >
                {section.label}
              </button>
            );
          })}
        </div>
        <p className="MultisHub__statsPanelKicker">{active.description}</p>
        <TipList tips={dataById[active.id]} paid={paid} />
      </div>
    </div>
  );
}
