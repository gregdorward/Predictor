import Collapsable from "./CollapsableElement";
import {
  isMissingStat,
  STAT_FALLBACK,
  statPercentDisplay,
} from "../utils/formatStat";
import { rankAmong } from "../logic/competitionRankings";

const MINUS = "\u2212";

function toNumber(value) {
  if (isMissingStat(value)) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function trimNumber(n) {
  return String(Math.round(n * 100) / 100);
}

function ordinal(n) {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  if (n % 10 === 1) return `${n}st`;
  if (n % 10 === 2) return `${n}nd`;
  if (n % 10 === 3) return `${n}rd`;
  return `${n}th`;
}

function formatValue(row, raw) {
  const n = toNumber(raw);
  if (n === null) return STAT_FALLBACK;
  const kind = row.kind || "split";
  if (kind === "percent") return statPercentDisplay(raw, row.decimals ?? null);
  if (kind === "rank") return ordinal(Math.round(n));
  if (kind === "signed") {
    const magnitude =
      typeof raw === "number" ? trimNumber(Math.abs(n)) : String(raw).trim().replace(/^[-+]/, "");
    if (n > 0) return `+${magnitude}`;
    if (n < 0) return `${MINUS}${magnitude}`;
    return "0";
  }
  return typeof raw === "number" ? trimNumber(n) : String(raw);
}

function readValue(row, stats) {
  return row.getValue ? row.getValue(stats || {}) : stats?.[row.key];
}

function formatAverage(row, value) {
  if (!Number.isFinite(value)) return STAT_FALLBACK;
  return row.kind === "percent" ? `${value.toFixed(1)}%` : trimNumber(value);
}

/** `averages.home` and `averages.away` differ only when each side is measured at its venue. */
function averageParts(row, averages) {
  if (!row.average || !averages) return null;
  const home = averages.home?.[row.average];
  const away = averages.away?.[row.average];
  if (!Number.isFinite(home) && !Number.isFinite(away)) return null;
  const homeText = formatAverage(row, home);
  const awayText = formatAverage(row, away);
  return averages.home === averages.away || homeText === awayText
    ? { single: homeText }
    : { home: homeText, away: awayText };
}

/**
 * `rankings.home[rowKey]` and `rankings.away[rowKey]` hold the other teams'
 * values for that row, so each side is ranked by the number it shows.
 */
function rankParts(row, rankings, home, away) {
  const homeRank = rankAmong(home, rankings?.home?.[row.key]);
  const awayRank = rankAmong(away, rankings?.away?.[row.key]);
  if (!homeRank || !awayRank) return null;
  const place = ({ rank, tied }) => `${tied ? "=" : ""}${ordinal(rank)}`;
  return {
    home: place(homeRank),
    away: place(awayRank),
    of: Math.max(homeRank.of, awayRank.of),
  };
}

function SplitBar({ home, away, homeTone, awayTone }) {
  const h = Math.max(0, home ?? 0);
  const a = Math.max(0, away ?? 0);
  if (h + a <= 0) {
    return <div className="StatCompare-bar StatCompare-bar--split is-empty" />;
  }
  // flex-grow totals below 1 leave part of the track empty, so grow by percentage share.
  const homeShare = (h / (h + a)) * 100;
  return (
    <div className="StatCompare-bar StatCompare-bar--split">
      {h > 0 ? (
        <span
          className={`StatCompare-fill StatCompare-fill--home ${homeTone}`}
          style={{ flexGrow: homeShare }}
        />
      ) : null}
      {a > 0 ? (
        <span
          className={`StatCompare-fill StatCompare-fill--away ${awayTone}`}
          style={{ flexGrow: 100 - homeShare }}
        />
      ) : null}
    </div>
  );
}

function signedFillStyle(value, maxAbs) {
  if (value == null || maxAbs <= 0) return { left: "50%", width: 0 };
  const width = (Math.abs(value) / maxAbs) * 50;
  return { left: `${value < 0 ? 50 - width : 50}%`, width: `${width}%` };
}

function SignedBar({ home, away, homeTone, awayTone }) {
  const maxAbs = Math.max(Math.abs(home ?? 0), Math.abs(away ?? 0));
  return (
    <div className="StatCompare-bar StatCompare-bar--signed">
      <span className="StatCompare-lane">
        <span
          className={`StatCompare-fill StatCompare-fill--home ${homeTone}`}
          style={signedFillStyle(home, maxAbs)}
        />
      </span>
      <span className="StatCompare-lane">
        <span
          className={`StatCompare-fill StatCompare-fill--away ${awayTone}`}
          style={signedFillStyle(away, maxAbs)}
        />
      </span>
      <span className="StatCompare-zero" />
    </div>
  );
}

function RankGap({ home, away }) {
  if (home == null || away == null) return null;
  const gap = Math.abs(Math.round(home) - Math.round(away));
  const text = gap === 0 ? "Level" : `${gap} ${gap === 1 ? "place" : "places"} apart`;
  return <span className="StatCompare-gap">{text}</span>;
}

function CompareBar({ row, home, away, homeTone, awayTone }) {
  const kind = row.kind || "split";
  if (kind === "rank") return <RankGap home={home} away={away} />;
  if (kind === "signed") {
    return <SignedBar home={home} away={away} homeTone={homeTone} awayTone={awayTone} />;
  }
  return <SplitBar home={home} away={away} homeTone={homeTone} awayTone={awayTone} />;
}

export function StatCompareRow({
  row,
  homeStats,
  awayStats,
  status,
  homeName,
  awayName,
  averages,
  rankings,
}) {
  const homeRaw = readValue(row, homeStats);
  const awayRaw = readValue(row, awayStats);
  const home = toNumber(homeRaw);
  const away = toNumber(awayRaw);
  const comparable = home !== null && away !== null;
  const homeEdge = comparable && status === "better";
  const awayEdge = comparable && status === "worse";
  const homeTone = homeEdge ? "is-edge" : awayEdge ? "is-muted" : "";
  const awayTone = awayEdge ? "is-edge" : homeEdge ? "is-muted" : "";
  const homeDisplay = formatValue(row, homeRaw);
  const awayDisplay = formatValue(row, awayRaw);
  const edgeName = homeEdge ? homeName : awayEdge ? awayName : null;
  const average = averageParts(row, averages);
  const averageText = !average
    ? null
    : average.single
      ? `Avg ${average.single}`
      : `Avg ${average.home} home, ${average.away} away`;
  const ranks = comparable ? rankParts(row, rankings, home, away) : null;
  const rankText = ranks ? `Ranked ${ranks.home} and ${ranks.away} of ${ranks.of}` : null;

  return (
    <li className={`StatCompare-row StatCompare-row--${row.kind || "split"}`} data-cy={row.cy || row.key}>
      <span className="StatCompare-srOnly">
        {`${row.label}: ${homeName} ${homeDisplay}, ${awayName} ${awayDisplay}.${
          edgeName ? ` ${edgeName} has the edge.` : ""
        }${averageText ? ` ${averageText.replace(/^Avg/, "Competition average")}.` : ""}${
          ranks
            ? ` ${homeName} ranked ${ranks.home}, ${awayName} ${ranks.away}, of ${ranks.of} teams.`
            : ""
        }`}
      </span>
      <span className={`StatCompare-value StatCompare-value--home ${homeTone}`} aria-hidden="true">
        {homeDisplay}
      </span>
      <span className="StatCompare-label" aria-hidden="true">
        {row.label}
        {averageText ? <span className="StatCompare-context">{averageText}</span> : null}
        {rankText ? <span className="StatCompare-context">{rankText}</span> : null}
      </span>
      <span className={`StatCompare-value StatCompare-value--away ${awayTone}`} aria-hidden="true">
        {awayDisplay}
      </span>
      <span className="StatCompare-visual" aria-hidden="true">
        <CompareBar row={row} home={home} away={away} homeTone={homeTone} awayTone={awayTone} />
      </span>
    </li>
  );
}

export function StatCompareRows({
  rows,
  homeStats,
  awayStats,
  statusMap,
  homeName,
  awayName,
  averages,
  rankings,
}) {
  return (
    <ul className="StatCompare-rows">
      {rows.map((row) => (
        <StatCompareRow
          key={row.key}
          row={row}
          homeStats={homeStats}
          awayStats={awayStats}
          status={statusMap?.[row.statusKey || row.key]}
          homeName={homeName}
          awayName={awayName}
          averages={averages}
          rankings={rankings}
        />
      ))}
    </ul>
  );
}

export function StatCompareHead({
  homeName,
  awayName,
  homeContext,
  awayContext,
  averageNote,
}) {
  return (
    <div className="StatCompare-head">
      <div className="StatCompare-teams">
        <span className="StatCompare-team StatCompare-team--home">
          <span className="StatCompare-teamName">{homeName}</span>
          {homeContext ? <span className="StatCompare-teamContext">{homeContext}</span> : null}
        </span>
        <span className="StatCompare-team StatCompare-team--away">
          <span className="StatCompare-teamName">{awayName}</span>
          {awayContext ? <span className="StatCompare-teamContext">{awayContext}</span> : null}
        </span>
      </div>
      <p className="StatCompare-key">
        The solid bar in each row has the edge.
        {averageNote ? ` ${averageNote}` : ""}
      </p>
    </div>
  );
}

/**
 * Head-to-head stat comparison. Pass `sections` for collapsible groups or
 * `rows` for a single flat list. `statusMap` is from the home side's view.
 */
export default function StatComparison({
  sections,
  rows,
  homeStats,
  awayStats,
  statusMap,
  homeName,
  awayName,
  homeContext,
  awayContext,
  averages,
  averageNote,
  rankings,
  getCollapsableProps,
  lockPremiumSections = false,
  style,
}) {
  const sectionProps = (section) => {
    const base =
      typeof getCollapsableProps === "function" ? getCollapsableProps(section.label) : {};
    if (!lockPremiumSections || section.free) return base;
    return { ...base, isOpen: false, locked: true };
  };

  const rowsFor = (list) => (
    <StatCompareRows
      rows={list}
      homeStats={homeStats}
      awayStats={awayStats}
      statusMap={statusMap}
      homeName={homeName}
      awayName={awayName}
      averages={averages}
      rankings={rankings}
    />
  );

  return (
    <section className="StatCompare" style={style}>
      <StatCompareHead
        homeName={homeName}
        awayName={awayName}
        homeContext={homeContext}
        awayContext={awayContext}
        averageNote={averages || rankings ? averageNote : null}
      />
      {sections
        ? sections.map((section) => (
            <Collapsable
              key={section.id}
              buttonText={section.label}
              classNameButton="StatHeader"
              classNameTwo="StatCompare-sectionBody"
              classNameThree="StatCompare-sectionExtra"
              {...sectionProps(section)}
              element={rowsFor(section.rows)}
            />
          ))
        : rowsFor(rows || [])}
    </section>
  );
}
