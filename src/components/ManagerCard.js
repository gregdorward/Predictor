const ManagerCard = ({ manager, title, side }) => {
    if (!manager) return null;

    const stats = manager.careerHistory || {};
    // Standardize the win percentage display
    const winPct = stats.winPercentage ? `${stats.winPercentage}%` : "0%";
    const previousWinPct = stats.previousClub?.winPercentage ? `${stats.previousClub.winPercentage}%` : "0%";
    const startTimestamp = stats?.startTimestamp || "N/A"; // Default to 0 if not available

    // Step 1: Convert to Milliseconds
    const dateObject = startTimestamp === "N/A" ? "N/A" : new Date(startTimestamp * 1000);

    // Step 2: Format (UK Style: DD/MM/YYYY)
    const formattedDate = dateObject === "N/A" ? "N/A" : dateObject.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    return (
        <div className={`manager-card ${side}`}>
            <span className="manager-label">{title}</span>
            <h4 className="manager-name">{manager.name}</h4>
            <h5 className="manager-hired">Hired: {formattedDate || "-"}</h5>

            <div className="manager-stats-grid">
                <div className="stat-item-played">
                    <span className="stat-value">{stats.total || 0}</span>
                    <span className="stat-label">P</span>
                </div>
                <div className="stat-item-wins">
                    <span className="stat-value">{stats.wins || 0}</span>
                    <span className="stat-label">W</span>
                </div>
                <div className="stat-item-draws">
                    <span className="stat-value">{stats.draws || 0}</span>
                    <span className="stat-label">D</span>
                </div>
                <div className="stat-item-losses">
                    <span className="stat-value">{stats.losses || 0}</span>
                    <span className="stat-label">L</span>
                </div>
            </div>

            <div className="win-pct-container">
                <div className="win-pct-bar-bg">
                    <div
                        className="win-pct-bar-fill"
                        style={{ width: winPct }}
                    ></div>
                </div>
                <span className="win-pct-text">Win Rate: {winPct}</span>
            </div>
            <div className="previous-team">
                <div className="previous-team-name">Previous Team: {stats.previousClub?.teamName || "N/A"}</div>
                <div className="manager-stats-grid">
                    <div className="stat-item-played">
                        <span className="stat-value">{stats.previousClub?.total || 0}</span>
                        <span className="stat-label">P</span>
                    </div>
                    <div className="stat-item-wins">
                        <span className="stat-value">{stats.previousClub?.wins || 0}</span>
                        <span className="stat-label">W</span>
                    </div>
                    <div className="stat-item-draws">
                        <span className="stat-value">{stats.previousClub?.draws || 0}</span>
                        <span className="stat-label">D</span>
                    </div>
                    <div className="stat-item-losses">
                        <span className="stat-value">{stats.previousClub?.losses || 0}</span>
                        <span className="stat-label">L</span>
                    </div>

                </div>
                <div className="win-pct-container-previous">
                    <div className="win-pct-bar-bg-previous">
                        <div
                            className="win-pct-bar-fill-previous"
                            style={{ width: previousWinPct }}
                        ></div>
                    </div>
                    <span className="win-pct-text">Win Rate: {previousWinPct}</span>
                </div>
            </div>
        </div>
    );
};

export const ManagerComparison = ({ homeManager, awayManager, homeTeam, awayTeam }) => {
    return (
        <div className="manager-comparison-container">
            <ManagerCard manager={homeManager} title={homeTeam} side="home" />
            <ManagerCard manager={awayManager} title={awayTeam} side="away" />
        </div>
    );
};