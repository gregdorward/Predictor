import React, { useEffect, useState } from "react";
import { BetSlipItem } from "../logic/getScorePredictions";
import {
  fetchLeaderboardRows,
  fetchTipsNewPayload,
  getMonthKey,
  getMonthLabel,
  mergeLeaderboardRows,
  slipsFromTipsNewPayload,
} from "../logic/predictionLeague";

const PredictionLeagueLeaderboard = ({
  slips: slipsProp,
  monthKey: monthKeyProp,
  initialLeaderboard = null,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState(null);

  const monthKey = monthKeyProp || getMonthKey();
  const monthLabel = getMonthLabel(monthKey);
  const [monthName, year] = monthLabel.split(" ");

  const toggleExpand = (uid) => {
    setExpandedUserId(expandedUserId === uid ? null : uid);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const hasSlips = slipsProp !== undefined;
      const hasLeaderboard =
        initialLeaderboard !== null && initialLeaderboard !== undefined;

      if (hasSlips && hasLeaderboard) {
        setData(mergeLeaderboardRows(initialLeaderboard, slipsProp));
        setLoading(false);
        return;
      }

      setLoading(true);

      let slips = slipsProp;
      if (!hasSlips) {
        const tipsPayload = await fetchTipsNewPayload();
        slips =
          tipsPayload && typeof tipsPayload === "object"
            ? slipsFromTipsNewPayload(tipsPayload, { monthKey })
            : [];
      }

      let leaderboard = initialLeaderboard;
      if (!hasLeaderboard) {
        leaderboard = await fetchLeaderboardRows(monthKey);
      }

      if (!cancelled) {
        setData(mergeLeaderboardRows(leaderboard, slips || []));
        setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [monthKey, slipsProp, initialLeaderboard]);

  if (loading) {
    return (
      <div className="leaderboard-loading" aria-live="polite">
        <span className="leaderboard-loading-dot" />
        Loading leaderboard…
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <header className="leaderboard-header">
        <div className="leaderboard-header-copy">
          <p className="leaderboard-kicker">Prediction League</p>
          <h3>{monthLabel}</h3>
        </div>
        <p className="leaderboard-hint">Open a row to see that tipster&apos;s slips</p>
      </header>

      {data.length === 0 ? (
        <p className="leaderboard-empty">Nobody on the board yet this month.</p>
      ) : (
        <div
          className="leaderboard-grid"
          role="table"
          aria-label={`${monthName} ${year} leaderboard`}
        >
          <div className="leaderboard-cols leaderboard-cols-header" role="row">
            <span role="columnheader">Rank</span>
            <span role="columnheader">Tipster</span>
            <span role="columnheader">Tips</span>
            <span role="columnheader">ROI</span>
            <span role="columnheader">Profit</span>
          </div>

          {data.map((row, index) => {
            const isExpanded = expandedUserId === row.uid;
            const rankClass =
              index < 3
                ? `leaderboard-rank is-top is-rank-${index + 1}`
                : "leaderboard-rank";
            const profitClass =
              row.monthlyProfit >= 0
                ? "leaderboard-profit is-positive"
                : "leaderboard-profit is-negative";
            const profitPrefix = row.monthlyProfit > 0 ? "+" : "";

            return (
              <div key={row.uid} className="leaderboard-entry">
                <div
                  className={`leaderboard-cols leaderboard-row ${isExpanded ? "active" : ""}`}
                  role="row"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onClick={() => toggleExpand(row.uid)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      toggleExpand(row.uid);
                    }
                  }}
                >
                  <span className={rankClass} role="cell">{index + 1}</span>
                  <span className="leaderboard-user" role="cell">
                    <strong>{row.displayName}</strong>
                    <span className="leaderboard-expand-cue" aria-hidden="true">
                      {isExpanded ? "−" : "+"}
                    </span>
                  </span>
                  <span className="leaderboard-metric" role="cell">
                    {row.userSlips.length}
                  </span>
                  <span className="leaderboard-metric" role="cell">
                    {row.roi.toFixed(1)}%
                  </span>
                  <span className={profitClass} role="cell">
                    {profitPrefix}
                    {row.monthlyProfit.toFixed(2)}
                  </span>
                </div>

                {isExpanded && (
                  <div className="expanded-tips-area">
                    <div className="expanded-content-wrapper">
                      <h4 className="expanded-header">
                        {row.displayName} tip record
                      </h4>
                      <div className="mini-slips-list">
                        {row.userSlips.map((slip) => (
                          <BetSlipItem key={slip.slipId} slip={slip} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/** @deprecated use PredictionLeagueLeaderboard */
const MonthlyLeaderboard = PredictionLeagueLeaderboard;

export default MonthlyLeaderboard;
export { PredictionLeagueLeaderboard };
