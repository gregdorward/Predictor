import { useState } from "react";
import SiteHeader from "./SiteHeader";
import PageMeta from "./PageMeta";
import JsonLd from "./JsonLd";
import ArticleShareButton, {
  ArticleDateLine,
} from "./articles/ArticleShareButton";
import previewData from "../data/premierLeague202627/season-preview.json";
import { buildPremierLeague202627OgImageUrl } from "../seo/pageMetaConfig";
import { buildPremierLeaguePreviewJsonLd } from "../seo/premierLeagueSeo";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "odds", label: "Market Odds" },
  { id: "storylines", label: "Storylines" },
  { id: "transfers", label: "Transfers" },
  { id: "table", label: "Predicted Table" },
  { id: "teams", label: "Club Guides" },
];

function formatGbDate(isoDate) {
  if (!isoDate) return null;
  const date = new Date(`${String(isoDate).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function OverviewTab({ data }) {
  const start = formatGbDate(data.format.startDate);
  const end = formatGbDate(data.format.endDate);

  return (
    <div className="WC26__section">
      <p className="WC26__overviewText">{data.overview}</p>

      <div className="WC26__formatCard">
        <h3 className="WC26__cardTitle">Season facts</h3>
        <ul className="WC26__formatList">
          <li>
            <strong>{start}</strong> - <strong>{end}</strong> ({data.format.matchweeks} matchweeks)
          </li>
          <li>Defending champions: <strong>{data.defendingChampion}</strong></li>
          <li>
            Promoted: {data.promoted.map((t) => t.name).join(", ")}
          </li>
          <li>
            Relegated out: {data.relegated.map((t) => t.name).join(", ")}
          </li>
          {data.format.notes?.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>

      <h3 className="WC26__sectionTitle">Promoted clubs</h3>
      <div className="WC26__cardGrid">
        {data.promoted.map((club) => (
          <div key={club.name} className="WC26__card">
            <h4>{club.name}</h4>
            <p className="WC26__cardMeta">
              {club.method} · {club.absenceYears} year{club.absenceYears === 1 ? "" : "s"} away
            </p>
            <p className="WC26__cardText">Manager: {club.manager}</p>
          </div>
        ))}
      </div>

      <h3 className="WC26__sectionTitle">European places this season</h3>
      <div className="WC26__formatCard">
        <ul className="WC26__formatList">
          <li>
            <strong>Champions League:</strong>{" "}
            {data.europeanPlaces.championsLeague.join(", ")}
          </li>
          <li>
            <strong>Europa League:</strong>{" "}
            {data.europeanPlaces.europaLeague.join(", ")}
          </li>
          <li>
            <strong>Conference League:</strong>{" "}
            {data.europeanPlaces.conferenceLeague.join(", ")}
          </li>
        </ul>
        <p className="WC26__cardText">{data.europeanPlaces.note}</p>
      </div>

      <h3 className="WC26__sectionTitle">Managerial changes</h3>
      <div className="WC26__cardGrid">
        {data.managerialChanges.map((change) => (
          <div key={change.team} className="WC26__card">
            <h4>{change.team}</h4>
            <p className="WC26__cardMeta">
              {change.outgoing} → <strong>{change.incoming}</strong>
            </p>
            <p className="WC26__cardText">{change.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function OddsTab({ data }) {
  return (
    <div className="WC26__section">
      <p className="WC26__matchesNote">
        {data.oddsProvider} title odds as of {formatGbDate(data.oddsAsOf)}.{" "}
        {data.oddsDisclaimer}
      </p>

      <h3 className="WC26__sectionTitle">Outright winner</h3>
      <div className="PL2627__oddsTableWrap">
        <table className="PL2627__oddsTable">
          <thead>
            <tr>
              <th scope="col">Team</th>
              <th scope="col">Fractional</th>
              <th scope="col">Decimal</th>
            </tr>
          </thead>
          <tbody>
            {data.marketOdds.winner.map((row) => (
              <tr key={row.team}>
                <td>{row.team}</td>
                <td>{row.fractional}</td>
                <td>{row.decimal != null ? row.decimal.toFixed(2) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.marketOdds.topFourNote ? (
        <p className="WC26__cardText PL2627__oddsNote">{data.marketOdds.topFourNote}</p>
      ) : null}

      <h3 className="WC26__sectionTitle">Relegation</h3>
      <div className="PL2627__oddsTableWrap">
        <table className="PL2627__oddsTable">
          <thead>
            <tr>
              <th scope="col">Team</th>
              <th scope="col">Fractional</th>
              <th scope="col">Decimal</th>
            </tr>
          </thead>
          <tbody>
            {data.marketOdds.relegation.map((row) => (
              <tr key={row.team}>
                <td>{row.team}</td>
                <td>{row.fractional}</td>
                <td>{row.decimal != null ? Number(row.decimal).toFixed(2) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StorylinesTab({ storylines }) {
  return (
    <div className="WC26__section">
      <div className="WC26__cardGrid WC26__cardGrid--single">
        {storylines.map((story) => (
          <div key={story.title} className="WC26__card">
            <h3 className="WC26__cardTitle">{story.title}</h3>
            <p className="WC26__cardText">{story.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransfersTab({ transfers }) {
  return (
    <div className="WC26__section">
      <p className="WC26__matchesNote">
        Confirmed or widely reported completed deals shaping the competitive balance.
        Window open until 31 August 2026.
      </p>
      <ul className="PL2627__transferList">
        {transfers.map((t) => (
          <li key={`${t.player}-${t.to}`} className="PL2627__transferItem">
            <div className="WC26__inlineHeader WC26__inlineHeader--split WC26__inlineHeader--block">
              <strong>{t.player}</strong>
              <span className="WC26__odds">{t.fee}</span>
            </div>
            <p className="WC26__cardMeta">
              {t.from} → {t.to}
            </p>
            <p className="WC26__cardText">{t.significance}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TableTab({ predictedTable }) {
  return (
    <div className="WC26__section">
      <p className="WC26__matchesNote">
        Predicted finishing order informed by current season analysis and Betfair
        market pricing - not odds alone.
      </p>
      <ol className="WC26__contenderList">
        {predictedTable.map((row) => (
          <li key={row.name} className="WC26__contenderItem">
            <span className="WC26__contenderRank">{row.predictedPosition}</span>
            <div className="WC26__contenderBody">
              <div className="WC26__inlineHeader WC26__inlineHeader--split WC26__inlineHeader--block">
                <strong>{row.name}</strong>
                <span className="PL2627__tierBadge">{row.tier}</span>
                {row.oddsFractional ? (
                  <span className="WC26__odds" title="Outright winner odds">
                    {row.oddsFractional}
                  </span>
                ) : null}
              </div>
              <p className="WC26__cardText">{row.blurb}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function TeamsTab({ teams }) {
  const [filter, setFilter] = useState("");
  const [expandedTeam, setExpandedTeam] = useState(null);
  const sorted = [...teams].sort(
    (a, b) => a.predictedPosition - b.predictedPosition
  );

  const q = filter.trim().toLowerCase();
  const filtered = q
    ? sorted.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.manager.toLowerCase().includes(q)
      )
    : sorted;

  return (
    <div className="WC26__section">
      <input
        type="search"
        className="WC26__search"
        placeholder="Search clubs or managers…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        aria-label="Filter clubs"
      />
      <p className="WC26__resultCount">{filtered.length} clubs</p>
      <div className="WC26__teamList">
        {filtered.map((team) => {
          const isOpen = expandedTeam === team.name;
          return (
            <div
              key={team.name}
              className={`WC26__teamCard${isOpen ? " WC26__teamCard--open" : ""}`}
            >
              <button
                type="button"
                className="WC26__teamCardToggle"
                onClick={() => setExpandedTeam(isOpen ? null : team.name)}
                aria-expanded={isOpen}
              >
                <span className="WC26__inlineHeader WC26__inlineHeader--grow">
                  <span className="WC26__teamName">
                    P{team.predictedPosition}. {team.name}
                  </span>
                </span>
                {team.outrightOdds?.fractional ? (
                  <span className="WC26__badge">{team.outrightOdds.fractional}</span>
                ) : team.relegationOdds?.fractional ? (
                  <span className="WC26__badge" title="Relegation odds">
                    Rel {team.relegationOdds.fractional}
                  </span>
                ) : null}
                <span className="WC26__teamPrediction">{team.manager}</span>
              </button>
              {isOpen && (
                <div className="WC26__teamCardBody">
                  <p className="WC26__cardMeta">Last season: {team.lastSeason}</p>
                  {team.outrightOdds?.fractional ? (
                    <p className="WC26__cardMeta">
                      Outright: {team.outrightOdds.fractional}
                      {team.outrightOdds.decimal != null
                        ? ` (${team.outrightOdds.decimal})`
                        : ""}
                    </p>
                  ) : null}
                  {team.relegationOdds?.fractional ? (
                    <p className="WC26__cardMeta">
                      Relegation: {team.relegationOdds.fractional}
                      {team.relegationOdds.decimal != null
                        ? ` (${team.relegationOdds.decimal})`
                        : ""}
                    </p>
                  ) : null}
                  <h5 className="WC26__keyPlayersTitle">Key arrivals</h5>
                  <ul className="WC26__keyPlayersList">
                    {team.keyArrivals.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <h5 className="WC26__keyPlayersTitle">Key departures</h5>
                  <ul className="WC26__keyPlayersList">
                    {team.keyDepartures.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className="WC26__cardText">{team.preview}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PremierLeague202627() {
  const [activeTab, setActiveTab] = useState("overview");
  const data = previewData;

  return (
    <>
      <PageMeta
        ogImage={buildPremierLeague202627OgImageUrl()}
        ogImageAlt="Premier League 2026/27 season preview — title race, odds and predicted table | Soccer Stats Hub"
      />
      <JsonLd data={buildPremierLeaguePreviewJsonLd(data)} />
      <SiteHeader showThemeToggle withFooter>
        <main className="WC26 PL2627">
          <a href="/" className="HomeLink">
            Home
          </a>

          <header className="WC26__hero">
            <div className="WC26__heroContent">
              <h1 className="WC26__title">Premier League 2026/27</h1>
              <p className="WC26__subtitle">Season Preview</p>
              <ArticleDateLine
                publishedAt={data.dataAsOf}
                dataAsOf={data.dataAsOf}
                authorLabel="Soccer Stats Hub"
              />
              <div className="PL2627__shareRow">
                <ArticleShareButton
                  title="Premier League 2026/27 Preview | Soccer Stats Hub"
                  text="Arsenal are 6/4 favourites, nine clubs have new managers, and the title race looks wide open. Full predicted table and club guides."
                />
              </div>
            </div>
            <div className="WC26__heroCards">
              <div className="WC26__heroCard WC26__heroCard--winner">
                <span className="WC26__heroLabel">Predicted champions</span>
                <div className="WC26__inlineHeader WC26__inlineHeader--hero">
                  <span className="WC26__heroTeam">{data.predictedWinner.team}</span>
                </div>
                <span className="WC26__odds">{data.predictedWinner.oddsFractional}</span>
                <p className="WC26__heroReason">
                  {data.predictedWinner.reasoning.length > 200
                    ? `${data.predictedWinner.reasoning.slice(0, 200)}…`
                    : data.predictedWinner.reasoning}
                </p>
              </div>
              <div className="WC26__heroCard WC26__heroCard--boot">
                <span className="WC26__heroLabel">Season window</span>
                <div className="WC26__inlineHeader WC26__inlineHeader--hero">
                  <span className="WC26__heroTeam">
                    {formatGbDate(data.format.startDate)} -{" "}
                    {formatGbDate(data.format.endDate)}
                  </span>
                </div>
                <span className="WC26__playerMeta">
                  Defending champions: {data.defendingChampion}
                </span>
                <p className="WC26__heroReason">{data.predictedWinner.consensusNote}</p>
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

          <div className="WC26__tabContent" id="ssh-content">
            <div hidden={activeTab !== "overview"} aria-hidden={activeTab !== "overview"}>
              <OverviewTab data={data} />
            </div>
            <div hidden={activeTab !== "odds"} aria-hidden={activeTab !== "odds"}>
              <OddsTab data={data} />
            </div>
            <div hidden={activeTab !== "storylines"} aria-hidden={activeTab !== "storylines"}>
              <StorylinesTab storylines={data.storylines} />
            </div>
            <div hidden={activeTab !== "transfers"} aria-hidden={activeTab !== "transfers"}>
              <TransfersTab transfers={data.keyTransfers} />
            </div>
            <div hidden={activeTab !== "table"} aria-hidden={activeTab !== "table"}>
              <TableTab predictedTable={data.predictedTable} />
            </div>
            <div hidden={activeTab !== "teams"} aria-hidden={activeTab !== "teams"}>
              <TeamsTab teams={data.teams} />
            </div>
          </div>
        </main>
      </SiteHeader>
    </>
  );
}
