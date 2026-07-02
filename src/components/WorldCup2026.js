import { useState } from "react";
import SiteHeader from "./SiteHeader";
import PageMeta from "./PageMeta";
import WorldCup2026MatchesTab from "./WorldCup2026MatchesTab";
import WorldCup2026NewsTab from "./WorldCup2026NewsTab";
import previewData from "../data/worldcup2026/tournament-preview.json";
import powerRankingsData from "../data/worldcup2026/power-rankings.json";
import AmazonAffiliateAds from "./AmazonAffiliateAds";
import JsonLd from "./JsonLd";
import { buildWorldCupNewsJsonLd } from "../seo/worldCupSeo";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "news", label: "News" },
  { id: "groups", label: "Groups" },
  { id: "teams", label: "Teams" },
  { id: "rankings", label: "Power Rankings" },
  { id: "matches", label: "Key Matches" },
];

function OverviewTab({ data }) {
  return (
    <div className="WC26__section">
      <p className="WC26__overviewText">{data.overview}</p>

      <div className="WC26__formatCard">
        <h3 className="WC26__cardTitle">Tournament format</h3>
        <ul className="WC26__formatList">
          <li>
            <strong>{data.format.teams}</strong> teams in <strong>{data.format.groups}</strong> groups
          </li>
          <li>Hosts: {data.format.hosts.join(", ")}</li>
          <li>
            {new Date(data.format.startDate + "T12:00:00").toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            -
            {new Date(data.format.endDate + "T12:00:00").toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </li>
          <li>32 teams advance to a new Round of 32 knockout stage</li>
        </ul>
      </div>

      <h3 className="WC26__sectionTitle">Host nations</h3>
      <div className="WC26__cardGrid">
        {data.hostNations.map((host) => (
          <div key={host.team} className="WC26__card">
            <div className="WC26__inlineHeader WC26__inlineHeader--block">
              <span className="WC26__flag">{host.flag}</span>
              <h4>{host.team}</h4>
              <span className="WC26__badge">Group {host.group}</span>
            </div>
            <p className="WC26__cardMeta">Prediction: {host.prediction}</p>
            <p className="WC26__cardText">{host.note}</p>
          </div>
        ))}
      </div>

      <h3 className="WC26__sectionTitle">Dark horses</h3>
      <div className="WC26__cardGrid">
        {data.darkHorses.map((item) => (
          <div key={item.team} className="WC26__card">
            <div className="WC26__inlineHeader WC26__inlineHeader--block">
              <span className="WC26__flag">{item.flag}</span>
              <h4>{item.team}</h4>
            </div>
            <p className="WC26__cardText">{item.reason}</p>
          </div>
        ))}
      </div>

      <h3 className="WC26__sectionTitle">Ones to watch</h3>
      <div className="WC26__playerGrid">
        {data.onesToWatch.map((player) => (
          <div key={`${player.player}-${player.team}`} className="WC26__playerCard">
            <strong className="WC26__inlineHeader">
              <span className="WC26__flag">{player.flag}</span>
              {player.player}
            </strong>
            <span className="WC26__playerMeta">
              {player.team} · age {player.age}
            </span>
            <p className="WC26__cardText">{player.note}</p>
          </div>
        ))}
      </div>

      <AmazonAffiliateAds
        placement="worldcup2026"
        title="World Cup fan picks"
        className="WC26__affiliates"
      />
    </div>
  );
}

function GroupsTab({ groups }) {
  return (
    <div className="WC26__section">
      <div className="WC26__groupGrid">
        {groups.map((group) => (
          <div key={group.group} className="WC26__groupCard">
            <h3 className="WC26__groupTitle">Group {group.group}</h3>
            <ol className="WC26__groupTeams">
              {group.teams.map((team) => (
                <li key={team}>{team}</li>
              ))}
            </ol>
            <div className="WC26__groupPredictions">
              <p><strong>1st:</strong> {group.predicted1st}</p>
              <p><strong>2nd:</strong> {group.predicted2nd}</p>
              <p className="WC26__keyGame">
                <strong>Key game:</strong> {group.keyGame}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamsTab({ teamPreviews }) {
  const [filter, setFilter] = useState("");
  const [expandedTeam, setExpandedTeam] = useState(null);

  const q = filter.trim().toLowerCase();
  const filtered = q
    ? teamPreviews.filter(
        (t) =>
          t.team.toLowerCase().includes(q) ||
          t.group.toLowerCase().includes(q) ||
          t.manager.toLowerCase().includes(q)
      )
    : teamPreviews;

  return (
    <div className="WC26__section">
      <input
        type="search"
        className="WC26__search"
        placeholder="Search teams, groups or managers…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        aria-label="Filter teams"
      />
      <p className="WC26__resultCount">{filtered.length} teams</p>
      <div className="WC26__teamList">
        {filtered.map((team) => {
          const isOpen = expandedTeam === team.team;
          return (
            <div
              key={team.team}
              className={`WC26__teamCard${isOpen ? " WC26__teamCard--open" : ""}`}
            >
              <button
                type="button"
                className="WC26__teamCardToggle"
                onClick={() => setExpandedTeam(isOpen ? null : team.team)}
                aria-expanded={isOpen}
              >
                <span className="WC26__inlineHeader WC26__inlineHeader--grow">
                  <span className="WC26__flag">{team.flag}</span>
                  <span className="WC26__teamName">{team.team}</span>
                </span>
                <span className="WC26__badge">Group {team.group}</span>
                <span className="WC26__teamPrediction">{team.prediction}</span>
              </button>
              {isOpen && (
                <div className="WC26__teamCardBody">
                  <p className="WC26__cardMeta">Manager: {team.manager}</p>
                  <p><strong>Style:</strong> {team.style}</p>
                  <p><strong>Strength:</strong> {team.strength}</p>
                  <p><strong>Weakness:</strong> {team.weakness}</p>
                  <h5 className="WC26__keyPlayersTitle">Key players</h5>
                  <ul className="WC26__keyPlayersList">
                    {team.keyPlayers.map((player) => (
                      <li key={player.name}>
                        <strong>{player.name}</strong> ({player.position}, {player.club}) -{" "}
                        {player.note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PowerRankingsTab({ rankings, goldenBoot }) {
  const updatedLabel = new Date(rankings.updatedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="WC26__section">
      <p className="WC26__matchesNote">
        Updated {updatedLabel}. {rankings.methodology}
      </p>
      <h3 className="WC26__sectionTitle">Power rankings</h3>
      <ol className="WC26__contenderList">
        {rankings.rankings.map((item) => (
          <li key={item.team} className="WC26__contenderItem">
            <span className="WC26__contenderRank">{item.rank}</span>
            <div className="WC26__contenderBody">
              <div className="WC26__inlineHeader WC26__inlineHeader--split WC26__inlineHeader--block">
                <span className="WC26__inlineHeader">
                  <span className="WC26__flag">{item.flag}</span>
                  <strong>{item.team}</strong>
                </span>
                <span className="WC26__odds" title="Estimated title win chance">
                  {item.winChance}
                </span>
              </div>
              <p className="WC26__contenderRecord">{item.record}</p>
              <p className="WC26__cardText">{item.summary}</p>
            </div>
          </li>
        ))}
      </ol>

      <h3 className="WC26__sectionTitle">Golden Boot</h3>
      <div className="WC26__goldenBootCard">
        <div className="WC26__inlineHeader WC26__inlineHeader--block">
          <span className="WC26__flag">{goldenBoot.predicted.flag}</span>
          <h4>{goldenBoot.predicted.player}</h4>
          <span className="WC26__badge">{goldenBoot.predicted.team}</span>
        </div>
        <p className="WC26__cardText">{goldenBoot.predicted.reasoning}</p>
      </div>
      <h4 className="WC26__subTitle">Other candidates</h4>
      <ul className="WC26__goldenBootList">
        {goldenBoot.candidates.map((c) => (
          <li key={c.player} className="WC26__goldenBootItem">
            <span className="WC26__inlineHeader">
              <span className="WC26__flag">{c.flag}</span>
              <strong>{c.player}</strong>
            </span>
            <span className="WC26__playerMeta">{c.team}</span>
            <span className="WC26__cardText"> - {c.note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function WorldCup2026() {
  const [activeTab, setActiveTab] = useState("overview");
  const data = previewData;

  return (
    <>
      <PageMeta />
      <JsonLd data={buildWorldCupNewsJsonLd()} />
      <SiteHeader showThemeToggle withFooter>
      <main className="WC26">
        <a href="/" className="HomeLink">Home</a>

        <header className="WC26__hero">
          <div className="WC26__heroContent">
            <h1 className="WC26__title">FIFA World Cup 2026</h1>
            <p className="WC26__subtitle">Tournament Preview</p>
          </div>
          <div className="WC26__heroCards">
            <div className="WC26__heroCard WC26__heroCard--winner">
              <span className="WC26__heroLabel">Predicted winner</span>
              <div className="WC26__inlineHeader WC26__inlineHeader--hero">
                <span className="WC26__flag WC26__flag--large">{data.predictedWinner.flag}</span>
                <span className="WC26__heroTeam">{data.predictedWinner.team}</span>
              </div>
              <span className="WC26__odds">{data.predictedWinner.oddsRange}</span>
              <p className="WC26__heroReason">
                {data.predictedWinner.reasoning.length > 180
                  ? `${data.predictedWinner.reasoning.slice(0, 180)}…`
                  : data.predictedWinner.reasoning}
              </p>
            </div>
            <div className="WC26__heroCard WC26__heroCard--boot">
              <span className="WC26__heroLabel">Golden Boot pick</span>
              <div className="WC26__inlineHeader WC26__inlineHeader--hero">
                <span className="WC26__flag WC26__flag--large">{data.goldenBoot.predicted.flag}</span>
                <span className="WC26__heroTeam">{data.goldenBoot.predicted.player}</span>
              </div>
              <span className="WC26__playerMeta">{data.goldenBoot.predicted.team}</span>
            </div>
          </div>
        </header>

        <nav className="WC26__tabs" aria-label="Preview sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`WC26__tab${activeTab === tab.id ? " WC26__tab--active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              aria-selected={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="WC26__tabContent">
          <div hidden={activeTab !== "overview"} aria-hidden={activeTab !== "overview"}>
            <OverviewTab data={data} />
          </div>
          <div hidden={activeTab !== "news"} aria-hidden={activeTab !== "news"}>
            <WorldCup2026NewsTab />
          </div>
          <div hidden={activeTab !== "groups"} aria-hidden={activeTab !== "groups"}>
            <GroupsTab groups={data.groups} />
          </div>
          <div hidden={activeTab !== "teams"} aria-hidden={activeTab !== "teams"}>
            <TeamsTab teamPreviews={data.teamPreviews} />
          </div>
          <div hidden={activeTab !== "rankings"} aria-hidden={activeTab !== "rankings"}>
            <PowerRankingsTab rankings={powerRankingsData} goldenBoot={data.goldenBoot} />
          </div>
          <div hidden={activeTab !== "matches"} aria-hidden={activeTab !== "matches"}>
            <WorldCup2026MatchesTab />
          </div>
        </div>
      </main>
      </SiteHeader>
    </>
  );
}
