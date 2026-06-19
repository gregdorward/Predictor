import { useState, useEffect } from "react";
import Collapsable from "./CollapsableElement";
import TeamOfTheSeason from "./TeamOfTheSeason";
import StatTable from "./StatTable";
import PlayerRankingTable from "./PlayerStatTable";
import { paid } from "../logic/getScorePredictions";
import { sofaScoreIds } from "../constants/sofaScoreIds";

function resolveScorerTeam(scorer, allTeams) {
  const teams = allTeams || [];
  const found = teams.find((team) => team.ID === scorer.club_team_id);
  if (found) return found.Name;
  return (
    scorer.club_team_name ||
    scorer.team_name ||
    scorer.club_name ||
    "—"
  );
}

function buildResultCollapsables(results) {
  if (!results?.length) return [];

  return results.map((result, index) => {
    const detail = (
      <div>
        <div className="ResultRow">
          <span className="column">{result.team_a_xg}</span>
          <span className="column">XG</span>
          <span className="column">{result.team_b_xg}</span>
        </div>
        <div className="ResultRow">
          <span className="column">{result.team_a_shots}</span>
          <span className="column">Shots</span>
          <span className="column">{result.team_b_shots}</span>
        </div>
        <div className="ResultRow">
          <span className="column">{result.team_a_shotsOnTarget}</span>
          <span className="column">SOT</span>
          <span className="column">{result.team_b_shotsOnTarget}</span>
        </div>
        <div className="ResultRow">
          <span className="column">{result.team_a_dangerous_attacks}</span>
          <span className="column">Dangerous Attacks</span>
          <span className="column">{result.team_b_dangerous_attacks}</span>
        </div>
        <div className="ResultRow">
          <span className="column">{result.team_a_possession}%</span>
          <span className="column">Possession</span>
          <span className="column">{result.team_b_possession}%</span>
        </div>
        <div className="ResultRow">
          <span className="column">{result.team_a_red_cards}</span>
          <span className="column">Red cards</span>
          <span className="column">{result.team_b_red_cards}</span>
        </div>
        <div className="ResultRow">
          <span className="column">{result.odds_ft_1}</span>
          <span className="column">Odds (pre-match)</span>
          <span className="column">{result.odds_ft_2}</span>
        </div>
      </div>
    );

    return (
      <Collapsable
        key={`result-${result.id || index}`}
        classNameButton="ResultButton"
        buttonText={
          <div className="ResultRowOverview">
            <div className="columnOverviewHome">{result.home_name}</div>
            <span className="columnOverviewScore">
              {result.homeGoalCount} : {result.awayGoalCount}
            </span>
            <div className="columnOverviewAway">{result.away_name}</div>
          </div>
        }
        element={detail}
      />
    );
  });
}

function getMediaId(leagueId) {
  for (const mapping of sofaScoreIds) {
    if (mapping.hasOwnProperty(leagueId)) {
      return mapping[leagueId];
    }
  }
  return null;
}

export default function LeagueTableExtras({
  Stats,
  allTeams,
  Id,
  Results,
  Date,
  RankingStats,
  PlayerRankingStats,
}) {
  const [mediaItems, setMediaItems] = useState([]);
  const derivedMediaId = getMediaId(Id);
  const leagueResults = buildResultCollapsables(Results);
  const topScorers = Stats?.top_scorers?.slice(0, 10) || [];
  const hasLeagueStats =
    Stats &&
    (Stats.seasonAVG_home != null ||
      Stats.seasonBTTSPercentage != null ||
      Stats.cornersAVG_overall != null);

  useEffect(() => {
    async function fetchMedia() {
      if (!derivedMediaId || !paid || !Date) {
        setMediaItems([]);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_EXPRESS_SERVER}getMedia/${derivedMediaId}/${Date}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.media && Array.isArray(data.media)) {
          setMediaItems(
            data.media.map((item) => ({
              url: item.url,
              thumbnailUrl: item.thumbnailUrl,
              title: item.title,
            }))
          );
        } else {
          setMediaItems([]);
        }
      } catch (error) {
        console.error("Error fetching media:", error);
        setMediaItems([]);
      }
    }

    fetchMedia();
  }, [derivedMediaId, Date]);

  const hasContent =
    mediaItems.length > 0 ||
    RankingStats?.topTeams ||
    PlayerRankingStats?.topPlayers ||
    leagueResults.length > 0 ||
    (derivedMediaId && paid) ||
    hasLeagueStats ||
    topScorers.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="LeagueTableExtras">
      {mediaItems.length > 0 && (
        <ul className="gallery-container">
          {mediaItems.map((item, index) => (
            <div key={`media-item-${index}`} className="gallery-item-wrapper">
              <h6 className="MediaTitle">{item.title}</h6>
              <li className="gallery-item MediaLinks">
                {item.thumbnailUrl ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={item.thumbnailUrl}
                      alt={`Media Thumbnail ${index + 1}`}
                      className="MediaImage"
                    />
                  </a>
                ) : (
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    View Media {index + 1}
                  </a>
                )}
              </li>
            </div>
          ))}
        </ul>
      )}

      {RankingStats?.topTeams && (
        <>
          <h5>League Rankings by Metric</h5>
          <StatTable
            rankingStats={RankingStats.topTeams}
            statKey="accurateCrosses"
          />
        </>
      )}

      {PlayerRankingStats?.topPlayers && (
        <>
          <h5>Player Rankings by Metric</h5>
          <PlayerRankingTable
            rankingStats={PlayerRankingStats.topPlayers}
            statKey="accurateLongBalls"
          />
        </>
      )}

      {leagueResults.length > 0 && (
        <>
          <h5>Results from last 2 weeks</h5>
          <div className="ResultsList" id="ResultsList">
            <ul>{leagueResults}</ul>
          </div>
        </>
      )}

      {derivedMediaId && paid && <TeamOfTheSeason id={derivedMediaId} />}

      {hasLeagueStats && (
        <>
          <div className="LeagueStatisticsHeader">League Statistics</div>
          <div className="LeagueStatistics">
            <ul className="LeagueStatsColumn">
              {Stats.seasonAVG_home != null && (
                <li>Average home goals: {Stats.seasonAVG_home}</li>
              )}
              {Stats.seasonAVG_away != null && (
                <li>Average away goals: {Stats.seasonAVG_away}</li>
              )}
              {Stats.seasonBTTSPercentage != null && (
                <li>BTTS: {Stats.seasonBTTSPercentage}%</li>
              )}
              {Stats.seasonOver05Percentage_overall != null && (
                <li>
                  Over 0.5 goals: {Stats.seasonOver05Percentage_overall}%
                </li>
              )}
              {Stats.seasonOver15Percentage_overall != null && (
                <li>
                  Over 1.5 goals: {Stats.seasonOver15Percentage_overall}%
                </li>
              )}
              {Stats.seasonOver25Percentage_overall != null && (
                <li>
                  Over 2.5 goals: {Stats.seasonOver25Percentage_overall}%
                </li>
              )}
              {Stats.seasonOver35Percentage_overall != null && (
                <li>
                  Over 3.5 goals: {Stats.seasonOver35Percentage_overall}%
                </li>
              )}
              {Stats.seasonOver45Percentage_overall != null && (
                <li>
                  Over 4.5 goals: {Stats.seasonOver45Percentage_overall}%
                </li>
              )}
            </ul>
            <ul className="LeagueStatsColumn">
              {Stats.over75CornersPercentage_overall != null && (
                <li>
                  Over 7.5 corners: {Stats.over75CornersPercentage_overall}%
                </li>
              )}
              {Stats.over85CornersPercentage_overall != null && (
                <li>
                  Over 8.5 corners: {Stats.over85CornersPercentage_overall}%
                </li>
              )}
              {Stats.over95CornersPercentage_overall != null && (
                <li>
                  Over 9.5 corners: {Stats.over95CornersPercentage_overall}%
                </li>
              )}
              {Stats.over105CornersPercentage_overall != null && (
                <li>
                  Over 10.5 corners: {Stats.over105CornersPercentage_overall}%
                </li>
              )}
              {Stats.over115CornersPercentage_overall != null && (
                <li>
                  Over 11.5 corners: {Stats.over115CornersPercentage_overall}%
                </li>
              )}
              {Stats.over125CornersPercentage_overall != null && (
                <li>
                  Over 12.5 corners: {Stats.over125CornersPercentage_overall}%
                </li>
              )}
              {Stats.cornersAVG_overall != null && (
                <li>Corners average: {Stats.cornersAVG_overall}</li>
              )}
              {Stats.cardsAVG_overall != null && (
                <li>Cards average: {Stats.cardsAVG_overall}</li>
              )}
            </ul>
            {topScorers.length > 0 && (
              <ul className="TopScorersColumn">
                <h4>Top scorers</h4>
                {topScorers.map((scorer, index) => (
                  <li key={`scorer-${scorer.id || index}`}>
                    {scorer.known_as} (
                    {resolveScorerTeam(scorer, allTeams)}):{" "}
                    {scorer.goals_overall}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {!hasLeagueStats && topScorers.length > 0 && (
        <>
          <div className="LeagueStatisticsHeader">Top scorers</div>
          <div className="LeagueStatistics">
            <ul className="TopScorersColumn">
              {topScorers.map((scorer, index) => (
                <li key={`scorer-${scorer.id || index}`}>
                  {scorer.known_as} ({resolveScorerTeam(scorer, allTeams)}):{" "}
                  {scorer.goals_overall}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
