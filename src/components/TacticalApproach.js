import React from 'react';
import Collapsable from "./CollapsableElement";


export function MatchTacticalComparison({
    homeTeam,
    awayTeam,
    homeTactics,
    awayTactics,
    homeOdds,
    awayOdds,
}) {
    // 1. Logic to determine the Expected Style based on current match odds

    const getExpectedStyle = (tacticalIdentity, odds, opponentOdds) => {
        let bracket = "BALANCED";

        if (odds < 1.3) bracket = "clear favourite";
        else if (odds < opponentOdds) bracket = "favourite";
        else if (opponentOdds < odds && odds < 4) bracket = "underdog";
        else bracket = "clear underdog";

        const styles = tacticalIdentity[bracket];
        if (!styles) return "Balanced";

        // Find style with highest frequency
        const topStyle = Object.keys(styles).reduce((a, b) =>
            styles[a] > styles[b] ? a : b
        );

        return topStyle.replace(/_/g, ' ');
    };

    const homeExpected = getExpectedStyle(homeTactics.preferredStyle, homeOdds, awayOdds);
    const awayExpected = getExpectedStyle(awayTactics.preferredStyle, awayOdds, homeOdds);

    // 2. Define the rows to render (mapping the keys to your data structure)
    const tacticalRows = [
        { label: "Low Block", key: "Low block" },
        { label: "High Press", key: "Pressing" },
        { label: "Dominant", key: "Dominant" },
        { label: "Balanced", key: "Balanced" },
        { label: "Patient Attacking", key: "Patient attacking" },
        { label: "Attacking", key: "Attacking" },
        { label: "Counter Attack", key: "Counter attack" },
    ];

    // 3. Helper to render a team's tactical card
    const renderTacticalCard = (teamName, teamData, expectedStyle, opponentExpectedStyle) => {
        return (
            <div className="TacticalTeamCard">
                <div className="TacticalList">
                    <div className="TeamName">{teamName}</div>
                    <div className="ExpectedStyleLabel">
                        Typical style in this profile of game: <span>{expectedStyle}</span>
                    </div>

                    <div className="StatDivider">Points gained against specific styles</div>

                    <div className="TacticalGrid">
                        {/* Header Row */}
                        <div className="TacticalRow header">
                            <div className="StyleLabel">Oppenent style</div>
                            <div className="StyleGames">Games faced</div>
                            <div className="StyleValue">PPG</div>
                        </div>

                        {/* Data Rows */}
                        {tacticalRows.map((row) => {
                            const isHighlighted = row.label.toLowerCase() === opponentExpectedStyle.toLowerCase();
                            const styleData = teamData.recordsAgainst[row.key];
                            const sortedOpponents = styleData?.opponents
                                ? [...styleData.opponents].sort((a, b) => new Date(b.date) - new Date(a.date))
                                : [];

                            return (
                                <div key={row.key} className="StyleGroupContainer">
                                    <Collapsable
                                        classNameButton={`StyleExpand ${isHighlighted ? 'highlight' : ''}`}
                                        buttonText={
                                            <div className="TacticalRow">
                                                <div className="StyleLabel">{row.label}  ☰</div>
                                                <div className="StyleGames">{styleData?.games || 0}</div>
                                                <div className="StyleValue">{styleData?.PPG || 0}</div>
                                            </div>
                                        }
                                        element={
                                            <div className="OpponentList">
                                                {sortedOpponents.length > 0 ? (
                                                    sortedOpponents.map((opp, idx) => (
                                                        <div key={idx} className="OpponentRow">
                                                            <span className="OppDate">{opp.date}</span>
                                                            <span className="OppName">{opp.team}</span>
                                                            <span className={`OppResult ${opp.result}`}>
                                                                {opp.goalsFor} - {opp.goalsAgainst}
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="NoData">No games recorded</div>
                                                )}
                                            </div>
                                        }
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="TacticalFixtureContainer">
            {/* Home Side: Highlights the style Away is expected to play */}
            {renderTacticalCard(homeTeam, homeTactics, homeExpected, awayExpected)}

            {/* Away Side: Highlights the style Home is expected to play */}
            {renderTacticalCard(awayTeam, awayTactics, awayExpected, homeExpected)}
        </div>
    );
}