import { Fragment, useState } from "react";
import SiteHeader from "./SiteHeader";
import {
  LOWER_LEAGUE_PULL_STEP,
  NAMED_LEAGUE_PULLS,
  OTHER_LEAGUE_PULL,
  groupDomesticLeagues,
} from "../logic/competitionStrengthBases";
import { STRENGTH_LONG_WINDOW, STRENGTH_WINDOW } from "../logic/strengthRankings";
import styles from "../styles/strength-rankings.module.css";

const TOP_COUNT = 5;

function formatUpdated(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  }).format(date);
}

function formatBasesDate(isoDate) {
  const date = new Date(`${String(isoDate).slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatDelta(delta) {
  const value = Math.round(Number(delta) * 10) / 10;
  if (!Number.isFinite(value)) return "";
  if (value === 0) return "0.0";
  const text = Math.abs(value).toFixed(1);
  return value > 0 ? `+${text}` : `-${text}`;
}

function deltaClass(delta) {
  const value = Number(delta);
  if (!Number.isFinite(value) || value === 0) return "";
  return value > 0 ? styles.up : styles.down;
}

function pillClass(letter) {
  if (letter === "W") return styles.win;
  if (letter === "L") return styles.loss;
  if (letter === "D") return styles.draw;
  return "";
}

function FormPills({ form }) {
  const letters = String(form || "").split("").filter(Boolean);
  if (!letters.length) return "No games yet";
  return (
    <span className={styles.pills} aria-label={`Form ${letters.join(" ")}`}>
      {letters.map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          className={`${styles.pill} ${pillClass(letter)}`.trim()}
        >
          {letter}
        </span>
      ))}
    </span>
  );
}

function teamKey(scope, slug, name) {
  return `${scope}:${slug}:${name}`;
}

function RankingTable({
  titleId,
  teams,
  restOpen,
  expandedKey,
  onToggleClub,
  onToggleRest,
  showCompetition,
  sampleSize,
}) {
  const hiddenCount = Math.max(0, teams.length - TOP_COUNT);
  const visible = restOpen || hiddenCount === 0 ? teams : teams.slice(0, TOP_COUNT);

  return (
    <>
      <div className={styles.scroll}>
        <table className={styles.table} aria-labelledby={titleId}>
          <thead>
            <tr>
              <th scope="col" className={styles.num}>
                Rank
              </th>
              <th scope="col">Club</th>
              {showCompetition ? <th scope="col">Competition</th> : null}
              <th
                scope="col"
                className={styles.num}
                title={`League base plus the last ${sampleSize === STRENGTH_LONG_WINDOW ? "ten" : "six"} results, weighted by opponent`}
              >
                Rating
              </th>
              <th scope="col" className={styles.formCol}>
                Form
              </th>
              <th scope="col">Opponent</th>
              <th scope="col" className={styles.num}>
                Opp rank
              </th>
              <th scope="col">Score</th>
              <th scope="col" className={styles.num} title="How much this result moved the rating">
                Added
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((team) => {
              const key = team.key;
              const open = expandedKey === key;
              return (
                <ClubRow
                  key={key}
                  team={team}
                  open={open}
                  showCompetition={showCompetition}
                  sampleSize={sampleSize}
                  onToggle={() => onToggleClub(key)}
                />
              );
            })}
          </tbody>
        </table>
      </div>
      {hiddenCount > 0 ? (
        <button type="button" className={styles.rest} onClick={onToggleRest}>
          {restOpen ? `Show the top ${TOP_COUNT}` : `Show the other ${hiddenCount}`}
        </button>
      ) : null}
    </>
  );
}

function MatchCells({ game }) {
  if (!game) {
    return (
      <>
        <td className={styles.desktopMatch}>n/a</td>
        <td className={`${styles.num} ${styles.desktopMatch}`}>n/a</td>
        <td className={styles.desktopMatch}>n/a</td>
        <td className={`${styles.num} ${styles.desktopMatch} ${styles.rowEnd}`}>n/a</td>
      </>
    );
  }
  return (
    <>
      <td className={`${styles.opponent} ${styles.desktopMatch}`}>{game.opponent}</td>
      <td className={`${styles.num} ${styles.desktopMatch}`}>
        {game.opponentRank == null ? "n/a" : game.opponentRank}
      </td>
      <td className={styles.desktopMatch}>
        {game.homeGoals}-{game.awayGoals}{" "}
        <span className={styles.venue}>{game.isHome ? "H" : "A"}</span>
      </td>
      <td className={`${styles.num} ${styles.desktopMatch} ${styles.rowEnd} ${deltaClass(game.delta)}`.trim()}>
        {formatDelta(game.delta)}
      </td>
    </>
  );
}

function FixtureGrid({ games }) {
  const rows = games.filter(Boolean);
  if (!rows.length) return null;
  return (
    <div className={styles.fixtureGrid}>
      {rows.map((game, index) => {
        const rank = game.opponentRank == null ? "n/a" : game.opponentRank;
        return (
          <Fragment key={`${game.dateUnix}-${game.opponent}-${index}`}>
            <span className={styles.fixName}>{game.opponent}</span>
            <span className={styles.fixRank}>{rank}</span>
            <span className={styles.fixScore}>
              <span className={styles.fixGoals}>
                {game.homeGoals}-{game.awayGoals}
              </span>
              <span className={styles.venue}>{game.isHome ? "H" : "A"}</span>
            </span>
            <span className={`${styles.fixDelta} ${deltaClass(game.delta)}`.trim()}>
              {formatDelta(game.delta)}
            </span>
          </Fragment>
        );
      })}
    </div>
  );
}

function ClubRow({ team, open, showCompetition, sampleSize, onToggle }) {
  const games = open ? team.matches : team.matches.slice(0, 1);
  const rows = games.length ? games : [null];
  const span = rows.length;

  return rows.map((game, index) => {
    const last = index === rows.length - 1;
    return (
      <tr
        key={`${team.key}-${index}`}
        className={`${index === 0 ? styles.clubRow : styles.matchLine} ${open ? styles.open : ""} ${open && last ? styles.groupEnd : ""}`.trim()}
        onClick={onToggle}
      >
        {index === 0 ? (
          <>
            <td className={styles.num} rowSpan={span}>
              {team.rank}
            </td>
            <th scope="row" rowSpan={span}>
              <button
                type="button"
                className={styles.club}
                aria-expanded={open}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggle();
                }}
              >
                {team.name}
              </button>
              <span className={styles.formUnder}>
                <FormPills form={team.form} />
              </span>
            </th>
            {showCompetition ? (
              <td className={styles.competition} rowSpan={span}>
                {team.leagueName}
              </td>
            ) : null}
            <td className={`${styles.num} ${styles.ratingCell}`} rowSpan={span}>
              <span className={styles.rating}>{team.rating}</span>
              <span className={styles.playedShort}>
                {team.played < sampleSize
                  ? `${team.played} of ${sampleSize}`
                  : `${team.played} played`}
              </span>
            </td>
            <td className={styles.formCol} rowSpan={span}>
              <FormPills form={team.form} />
            </td>
          </>
        ) : null}
        <MatchCells game={game} />
        {index === 0 ? (
          <td className={styles.fixtureOnly} colSpan={4}>
            <FixtureGrid games={rows} />
          </td>
        ) : null}
      </tr>
    );
  });
}

function storedWindow(overview, sample) {
  const stored = overview?.windows?.[sample] ?? overview?.windows?.[String(sample)];
  if (stored && Array.isArray(stored.global) && Array.isArray(stored.leagues)) return stored;
  return null;
}

function windowView(overview, sample) {
  return (
    storedWindow(overview, sample) || {
      leagues: overview?.leagues || [],
      global: overview?.global || [],
    }
  );
}

export default function StrengthRankings({ overview, preview = false }) {
  const [sample, setSample] = useState(STRENGTH_WINDOW);
  const view = windowView(overview, sample);
  const groups = groupDomesticLeagues(view.leagues || []);
  const globalTeams = view.global || [];
  const hasTen = Boolean(storedWindow(overview, STRENGTH_LONG_WINDOW)?.global?.length);
  const hasDomestic = groups.some((group) => group.leagues.some((league) => league.teams?.length));
  const hasGlobal = globalTeams.length > 0;
  const [scope, setScope] = useState(hasDomestic ? "domestic" : "global");
  const [country, setCountry] = useState(
    groups.some((group) => group.country === "England")
      ? "England"
      : groups[0]?.country || ""
  );
  const [expandedOverride, setExpandedOverride] = useState(null);
  const [restOpen, setRestOpen] = useState({});

  const activeCountry = groups.some((group) => group.country === country)
    ? country
    : groups[0]?.country || "";
  const countryGroup = groups.find((group) => group.country === activeCountry);
  const updated = formatUpdated(overview?.generatedAt);
  const basesDate = formatBasesDate(overview?.basesAsOf);
  const stepDown = (overview?.leagues || []).some((league) => league.source === "step-down");
  const bigLeaguePull = (overview?.leagues || []).some(
    (league) => Number.isFinite(Number(league.clubElo)) && Number(league.clubElo) !== Number(league.base)
  );

  const defaultKey = (() => {
    if (scope === "global") {
      const team = globalTeams[0];
      return team ? teamKey("global", "all", team.name) : "";
    }
    const league = countryGroup?.leagues.find((row) => row.teams?.length);
    const team = league?.teams?.[0];
    return league && team ? teamKey("domestic", league.slug, team.name) : "";
  })();
  const expandedKey = expandedOverride == null ? defaultKey : expandedOverride;

  function resetOpen() {
    setExpandedOverride(null);
    setRestOpen({});
  }

  function toggleClub(key) {
    setExpandedOverride(expandedKey === key ? "" : key);
  }

  if (!hasDomestic && !hasGlobal) {
    return (
      <SiteHeader showThemeToggle withFooter wide>
        <main className={styles.page} id="ssh-content">
          <PageIntro sample={sample} />
          <p className={styles.empty}>
            Strength rankings refresh each morning from finished matches. Check
            back shortly, or browse <a href="/competitions/">all competitions</a>{" "}
            in the meantime.
          </p>
        </main>
      </SiteHeader>
    );
  }

  return (
    <SiteHeader showThemeToggle withFooter wide>
      <main className={styles.page} id="ssh-content">
        <PageIntro sample={sample} />
        {preview ? (
          <p className={styles.banner} role="status">
            These figures are a layout sample, not live ratings.
          </p>
        ) : null}
        <div className={styles.controls}>
          <div className={styles.switch} role="group" aria-label="Ranking scope">
            <button
              type="button"
              className={styles.chip}
              aria-pressed={scope === "domestic"}
              onClick={() => {
                setScope("domestic");
                resetOpen();
              }}
            >
              Domestic
            </button>
            <button
              type="button"
              className={styles.chip}
              aria-pressed={scope === "global"}
              onClick={() => {
                setScope("global");
                resetOpen();
              }}
            >
              Global
            </button>
          </div>
          <div className={styles.switch} role="group" aria-label="Results counted">
            <button
              type="button"
              className={styles.chip}
              aria-pressed={sample === STRENGTH_WINDOW}
              onClick={() => {
                setSample(STRENGTH_WINDOW);
                resetOpen();
              }}
            >
              6 games
            </button>
            <button
              type="button"
              className={styles.chip}
              aria-pressed={sample === STRENGTH_LONG_WINDOW}
              disabled={!hasTen}
              onClick={() => {
                if (!hasTen) return;
                setSample(STRENGTH_LONG_WINDOW);
                resetOpen();
              }}
            >
              10 games
            </button>
          </div>
          {scope === "domestic" ? (
            <div className={styles.countries} role="group" aria-label="Country">
              {groups.map((group) => (
                <button
                  key={group.country}
                  type="button"
                  className={styles.chip}
                  aria-pressed={group.country === activeCountry}
                  onClick={() => {
                    setCountry(group.country);
                    resetOpen();
                  }}
                >
                  {group.country}
                </button>
              ))}
            </div>
          ) : null}
          {updated ? <p className={styles.updated}>Updated {updated}.</p> : null}
        </div>

        {scope === "global" ? (
          <section className={styles.league} aria-labelledby="strength-worldwide">
            <h2 className={styles.leagueTitle} id="strength-worldwide">
              Worldwide
              <span className={styles.base}>Each club starts from its own league base</span>
            </h2>
            <RankingTable
              titleId="strength-worldwide"
              teams={globalTeams.map((team) => ({
                ...team,
                key: teamKey("global", "all", team.name),
              }))}
              restOpen={Boolean(restOpen.global)}
              expandedKey={expandedKey}
              showCompetition
              sampleSize={sample}
              onToggleClub={toggleClub}
              onToggleRest={() =>
                setRestOpen((current) => ({ ...current, global: !current.global }))
              }
            />
          </section>
        ) : (
          (countryGroup?.leagues || []).map((league) => {
            const titleId = `strength-${league.slug}`;
            return (
              <section key={league.slug} className={styles.league} aria-labelledby={titleId}>
                <h2 className={styles.leagueTitle} id={titleId}>
                  {league.name}
                  <span className={styles.base}>Base {league.base}</span>
                </h2>
                <RankingTable
                  titleId={titleId}
                  teams={(league.teams || []).map((team) => ({
                    ...team,
                    key: teamKey("domestic", league.slug, team.name),
                  }))}
                  restOpen={Boolean(restOpen[league.slug])}
                  expandedKey={expandedKey}
                  showCompetition={false}
                  sampleSize={sample}
                  onToggleClub={toggleClub}
                  onToggleRest={() =>
                    setRestOpen((current) => ({
                      ...current,
                      [league.slug]: !current[league.slug],
                    }))
                  }
                />
              </section>
            );
          })
        )}

        <p className={styles.note}>
          {basesDate
            ? `League bases are adjusted from ClubElo averages from ${basesDate}.`
            : "League bases are adjusted from ClubElo averages."}{" "}
          {stepDown
            ? "Where ClubElo does not publish a division average, that figure steps down 100 points from the division above."
            : null}
          {bigLeaguePull
            ? ` La Liga, Ligue 1 and the Bundesliga are moved ${Math.round(NAMED_LEAGUE_PULLS["la-liga"] * 100)}% of the way from their ClubElo average toward the Premier League. Serie A is moved ${Math.round(NAMED_LEAGUE_PULLS["serie-a"] * 100)}%. Brazil Serie A is moved ${Math.round(NAMED_LEAGUE_PULLS["brazil-serie-a"] * 100)}%. Argentina, the Segunda Division, the Belgian Pro League and the Championship are moved ${Math.round(OTHER_LEAGUE_PULL * 100)}%. Each competition below the Championship is moved ${Math.round(LOWER_LEAGUE_PULL_STEP * 100)} percentage point${Math.round(LOWER_LEAGUE_PULL_STEP * 100) === 1 ? "" : "s"} less than the one above. National League North and South share the same figure.`
            : null}
        </p>
        <p className={styles.note}>
          If you quote these numbers, please credit: Source: Soccer Stats Hub
          (soccerstatshub.com). A link is appreciated but not required.
        </p>
        <nav className={styles.related} aria-label="Related pages">
          <h2>Related</h2>
          <ul>
            <li>
              <a href="/competitions/">Competitions</a>
            </li>
            <li>
              <a href="/market-reliability/">Market Reliability</a>
            </li>
          </ul>
        </nav>
      </main>
    </SiteHeader>
  );
}

function PageIntro({ sample }) {
  const countWord = sample === STRENGTH_LONG_WINDOW ? "ten" : "six";
  return (
    <>
      <nav className={styles.crumb} aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span aria-hidden="true"> / </span>
        <span>Strength rankings</span>
      </nav>
      <h1 className={styles.title}>Strength rankings</h1>
      <p className={styles.intro}>
        Which teams have been the strongest in their competition and globally over the past {countWord} games? The rank takes a baseline competition ranking and applies weights based on the strength of the opponent, how recent the
        game was and by the margin of the result.
      </p>
    </>
  );
}
