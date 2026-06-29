import { useEffect, useRef, useState } from "react";
import { resolveScorerTeam } from "./competitionUtils";

const LEADER_TABS = [
  {
    id: "goals",
    label: "Top scorers",
    dataKey: "top_scorers",
    statField: "goals_overall",
  },
  {
    id: "assists",
    label: "Top assists",
    dataKey: "top_assists",
    statField: "assists_overall",
  },
  {
    id: "cleansheets",
    label: "Clean sheets",
    dataKey: "top_clean_sheets",
    statField: "clean_sheets_overall",
  },
];

function buildTabs(data) {
  return LEADER_TABS.map((tab) => ({
    ...tab,
    players: (data?.[tab.dataKey] || []).slice(0, 10),
  })).filter((tab) => tab.players.length > 0);
}

export default function CompetitionPlayerLeaders({ data, teams }) {
  const tabs = buildTabs(data);
  const swipeRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [data?.id]);

  if (!tabs.length) return null;

  function selectTab(index) {
    setActiveIndex(index);
    const container = swipeRef.current;
    if (!container) return;
    container.scrollTo({
      left: index * container.clientWidth,
      behavior: "smooth",
    });
  }

  function handleScroll() {
    const container = swipeRef.current;
    if (!container || !container.clientWidth) return;
    const index = Math.round(container.scrollLeft / container.clientWidth);
    if (index !== activeIndex && index >= 0 && index < tabs.length) {
      setActiveIndex(index);
    }
  }

  return (
    <section className="Competition__section">
      <h2 className="Competition__sectionHeading">Player leaders</h2>

      <div
        className="Competition__playerTabs"
        role="tablist"
        aria-label="Player leader categories"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            className={`Competition__playerTab${
              activeIndex === index ? " Competition__playerTab--active" : ""
            }`}
            aria-selected={activeIndex === index}
            onClick={() => selectTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        ref={swipeRef}
        className="Competition__playerSwipe"
        onScroll={handleScroll}
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className="Competition__playerPanel"
            role="tabpanel"
            aria-label={tab.label}
          >
            <ul className="Competition__scorersList">
              {tab.players.map((player, index) => (
                <li key={`${tab.id}-${player.id || index}`}>
                  <span className="Competition__scorerRank">{index + 1}</span>
                  <span className="Competition__scorerName">
                    {player.known_as || player.full_name}
                  </span>
                  <span className="Competition__scorerTeam">
                    {resolveScorerTeam(player, teams)}
                  </span>
                  <strong className="Competition__scorerGoals">
                    {player[tab.statField] ?? "—"}
                  </strong>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
