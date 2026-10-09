import React, { useMemo, useState } from "react";
import { STAT_FALLBACK } from "../utils/formatStat";
import { requestUpgrade } from "../logic/requestUpgrade";

const scrollToTarget = (id) => {
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

function PaidInsightsNotice() {
  return (
    <button
      type="button"
      className="InsightsHub__upgrade PaidFeatureNotice UnlockBanner"
      onClick={() => requestUpgrade()}
    >
      Showing top 5 only. Upgrade for the full top 10.
    </button>
  );
}

const INSIGHT_SECTIONS = [
  {
    id: "value-best",
    tab: "Best value",
    title: "Best betting value",
    subtitle: "Points difference from bookies' expectations (last 5)",
    itemsKey: "trueFormArray",
    sortOrder: "desc",
    operator: "",
    showUpgrade: true,
    freeRowLimit: 5,
  },
  {
    id: "value-worst",
    tab: "Worst value",
    title: "Worst betting value",
    subtitle: "Points difference from bookies' expectations (last 5)",
    itemsKey: "trueFormArray",
    sortOrder: "asc",
    operator: "",
    showUpgrade: true,
    freeRowLimit: 10,
  },
  {
    id: "xg-diff",
    tab: "xG diff",
    title: "Best xG difference",
    subtitle: "xG goal difference (last 5)",
    itemsKey: "XGDiffArray",
    sortOrder: "desc",
    operator: "",
    showUpgrade: true,
    freeRowLimit: 5,
  },
  {
    id: "goal-diff",
    tab: "Goal diff",
    title: "Best goal difference",
    subtitle: "Goal difference (last 5)",
    itemsKey: "goalDiffArray",
    sortOrder: "desc",
    operator: "",
    showUpgrade: false,
    freeRowLimit: 5,
  },
  {
    id: "sot",
    tab: "SOT",
    title: "Most shots on target",
    subtitle: "Average shots on target (last 5)",
    itemsKey: "sotArray",
    sortOrder: "desc",
    operator: "",
    showUpgrade: true,
    freeRowLimit: 5,
  },
  {
    id: "btts",
    tab: "BTTS",
    title: "Best for BTTS",
    subtitle: "Share of matches ending in BTTS (last 5)",
    itemsKey: "bttsArray",
    sortOrder: "desc",
    operator: "%",
    showUpgrade: true,
    freeRowLimit: 5,
  },
  {
    id: "corners",
    tab: "Corners",
    title: "Most corners",
    subtitle: "Average corners (last 5)",
    itemsKey: "cornersArray",
    sortOrder: "desc",
    operator: "",
    showUpgrade: true,
    freeRowLimit: 5,
  },
  {
    id: "cards",
    tab: "Cards",
    title: "Most cards",
    subtitle: "Average cards (all matches)",
    itemsKey: "cardsArray",
    sortOrder: "desc",
    operator: "",
    showUpgrade: true,
    freeRowLimit: 5,
  },
];

function formatScore(score, operator) {
  if (!Number.isFinite(Number(score))) {
    return STAT_FALLBACK;
  }
  const value = Number(score).toFixed(2);
  return operator ? `${value}${operator}` : value;
}

function InsightRankingsTable({
  title,
  subtitle,
  items,
  operator,
  sortOrder,
  limit,
  paidUser,
  showUpgrade,
}) {
  const sortedItems = useMemo(() => {
    const source = items ? [...items] : [];
    return source.sort((a, b) =>
      sortOrder === "desc" ? b.score - a.score : a.score - b.score
    );
  }, [items, sortOrder]);

  const list = sortedItems.slice(0, limit);
  const isEmpty = list.length === 0;

  return (
    <div className="InsightsHub__panel">
      <header className="InsightsHub__panelHeader">
        <h3 className="InsightsHub__panelTitle">{title}</h3>
        <p className="InsightsHub__panelSubtitle">{subtitle}</p>
      </header>

      {isEmpty ? (
        <p className="InsightsHub__empty" role="status">No data for this category yet.</p>
      ) : (
        <div className="InsightsHub__tableWrap">
          <table className="InsightsHub__table">
            <thead>
              <tr>
                <th scope="col" className="InsightsHub__colRank">#</th>
                <th scope="col" className="InsightsHub__colTeam">Team</th>
                <th scope="col" className="InsightsHub__colMetric">Stat</th>
                <th scope="col" className="InsightsHub__colFixture">Fixture</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item, index) => (
                <tr key={`${item.gameId}-${item.name}-${index}`}>
                  <td className="InsightsHub__colRank">
                    <span className="InsightsHub__rank" aria-hidden="true">{index + 1}</span>
                  </td>
                  <td className="InsightsHub__colTeam">
                    <span className="InsightsHub__teamName">{item.name}</span>
                  </td>
                  <td className="InsightsHub__colMetric">
                    <span className="InsightsHub__metric">{formatScore(item.score, operator)}</span>
                  </td>
                  <td className="InsightsHub__colFixture">
                    <a
                      href={`#${item.gameId}`}
                      className="InsightsHub__fixtureLink"
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToTarget(item.gameId);
                      }}
                    >
                      {item.game}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!paidUser && showUpgrade ? <PaidInsightsNotice /> : null}
    </div>
  );
}

export const InsightsPanel = ({ statsArray, paidUser }) => {
  const [activeId, setActiveId] = useState(INSIGHT_SECTIONS[0].id);

  if (!statsArray) {
    return (
      <div className="InsightsHub__loading" role="status">
        Loading form leaders…
      </div>
    );
  }

  const activeSection =
    INSIGHT_SECTIONS.find((section) => section.id === activeId) ?? INSIGHT_SECTIONS[0];
  const rowLimit = paidUser ? 10 : (activeSection.freeRowLimit ?? 5);

  return (
    <div className="InsightsHub__panelRoot">
      <p className="InsightsHub__lede">
        Teams ranked by form and market stats for today&apos;s fixtures. Choose a category, then open
        a match from the list above.
      </p>

      <div
        className="InsightsHub__tabs"
        role="tablist"
        aria-label="Insight categories"
      >
        {INSIGHT_SECTIONS.map((section) => {
          const selected = section.id === activeId;
          return (
            <button
              key={section.id}
              type="button"
              role="tab"
              id={`insights-tab-${section.id}`}
              aria-selected={selected}
              aria-controls={`insights-panel-${section.id}`}
              tabIndex={selected ? 0 : -1}
              className={`InsightsHub__tab${selected ? " InsightsHub__tab--active" : ""}`}
              onClick={() => setActiveId(section.id)}
            >
              {section.tab}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`insights-panel-${activeSection.id}`}
        aria-labelledby={`insights-tab-${activeSection.id}`}
        className="InsightsHub__tabPanel"
      >
        <InsightRankingsTable
          title={activeSection.title}
          subtitle={activeSection.subtitle}
          items={statsArray[activeSection.itemsKey]}
          operator={activeSection.operator}
          sortOrder={activeSection.sortOrder}
          limit={rowLimit}
          paidUser={paidUser}
          showUpgrade={activeSection.showUpgrade}
        />
      </div>
    </div>
  );
};
