import { useState } from "react";
import StatsInContentAd from "./StatsInContentAd";
import StatPageSeoContent from "./StatPageSeoContent";

export default function StatHubLayout({
  title,
  proof,
  seasonLabel = "Season",
  todayLabel = "Today",
  switchable = false,
  season,
  today,
  seo,
  footer = null,
}) {
  const [pane, setPane] = useState("season");

  return (
    <div
      className={`SubpageContent StatHub${switchable ? " StatHub--panes" : ""}`}
      id="ssh-content"
      data-pane={pane}
    >
      <a className="StatHub-home" href="/">
        ← Back to Home
      </a>
      <header className="StatHub-intro">
        <h1>{title}</h1>
        {proof ? <p className="StatHub-proof">{proof}</p> : null}
      </header>
      {switchable ? (
        <div className="StatHub-switch" role="tablist" aria-label="Which list to show">
          <button
            type="button"
            role="tab"
            id="stat-hub-tab-season"
            aria-selected={pane === "season"}
            aria-controls="stat-hub-season"
            onClick={() => setPane("season")}
          >
            {seasonLabel}
          </button>
          <button
            type="button"
            role="tab"
            id="stat-hub-tab-today"
            aria-selected={pane === "today"}
            aria-controls="stat-hub-today"
            onClick={() => setPane("today")}
          >
            {todayLabel}
          </button>
        </div>
      ) : null}
      <div className="StatHub-board">
        <div className="StatHub-season" id="stat-hub-season" role={switchable ? "tabpanel" : undefined}>
          {season}
        </div>
        <div className="StatHub-today" id="stat-hub-today" role={switchable ? "tabpanel" : undefined}>
          {today}
        </div>
      </div>
      <div className="StatHub-after">
        <StatPageSeoContent {...seo} intro="" />
        <StatsInContentAd />
        {footer}
      </div>
    </div>
  );
}

const HUB_OPEN_SYMBOL = "\u{29C9}";

export function HubFixtureLink({ href, children }) {
  if (!href) return children;
  return (
    <a className="StatHub-link" href={href}>
      {children}
      <span className="StatHub-linkOpen" aria-hidden="true">
        {HUB_OPEN_SYMBOL}
      </span>
    </a>
  );
}

export function EmptyHubRow({ colSpan, children }) {
  return (
    <tr>
      <td className="StatHub-empty" colSpan={colSpan}>
        {children}
      </td>
    </tr>
  );
}
