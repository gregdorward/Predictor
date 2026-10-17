import React, { useMemo, useState } from "react";
import { requestUpgrade } from "../../logic/requestUpgrade";
import {
  STATS_TIP_SECTIONS,
  formatStatsTipMetric,
} from "../../utils/formatStatsTipsShareText";
import StatsTipsShare from "./StatsTipsShare";

const FREE_TIP_LIMIT = 2;

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

function StatsTipLeg({ tip, sectionId }) {
  const stripeClass = `MultisHub__legOutcome ${outcomeStripeClass(tip.outcome)}`;
  const section =
    STATS_TIP_SECTIONS.find((s) => s.id === sectionId) || STATS_TIP_SECTIONS[0];
  const metricValue = formatStatsTipMetric(tip, sectionId);

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
              <span className="MultisHub__legMetric">
                {section.metricColumn} {metricValue}
              </span>
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

function TipList({ tips, paid, sectionId, freeLimit = FREE_TIP_LIMIT }) {
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
          <StatsTipLeg
            key={tip.id || tip.game}
            tip={tip}
            sectionId={sectionId}
          />
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

const SECTION_DESCRIPTIONS = {
  xg: "Largest xG differentials (last 5)",
  points: "Largest points-per-game differentials (last 6)",
  goals: "Largest goal differentials (last 5)",
  attacks: "Largest dangerous-attacks differentials (last 5)",
  sot: "Largest shots-on-target differentials (last 5)",
};

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

  const active =
    STATS_TIP_SECTIONS.find((s) => s.id === activeId) || STATS_TIP_SECTIONS[0];
  const activeTips = dataById[active.id] || [];
  const shareableTips = useMemo(
    () => (paid ? activeTips : activeTips.slice(0, FREE_TIP_LIMIT)),
    [activeTips, paid]
  );

  return (
    <div className="MultisHub__statsPanel">
      <div role="tabpanel" className="MultisHub__statsPanelBody">
        <p className="MultisHub__sectionLede">
          Tips from stat differentials for today&apos;s fixtures. Select a fixture to open its match
          card.
        </p>
        <div className="MultisHub__carouselTabs" role="tablist" aria-label="Stats tip categories">
          {STATS_TIP_SECTIONS.map((section) => {
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
        <p className="MultisHub__statsPanelKicker">
          {SECTION_DESCRIPTIONS[active.id]}
        </p>
        <TipList
          tips={activeTips}
          paid={paid}
          sectionId={active.id}
          freeLimit={FREE_TIP_LIMIT}
        />
        <StatsTipsShare sectionId={active.id} tips={shareableTips} />
      </div>
    </div>
  );
}
