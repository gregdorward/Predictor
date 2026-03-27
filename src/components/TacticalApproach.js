import React from 'react';

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
        { label: "Patient Attack", key: "Patient attacking" },
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
                            // Check if this row matches the style the opponent is expected to use
                            const isHighlighted = row.label.toLowerCase() === opponentExpectedStyle.toLowerCase();

                            return (
                                <div
                                    key={row.key}
                                    className={`TacticalRow ${isHighlighted ? 'highlight' : ''}`}
                                >
                                    <div className="StyleLabel">{row.label}</div>
                                    <div className="StyleGames">
                                        {teamData.recordsAgainst[row.key]?.games || 0}
                                    </div>
                                    <div className="StyleValue">
                                        {teamData.recordsAgainst[row.key]?.PPG || 0}
                                    </div>
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