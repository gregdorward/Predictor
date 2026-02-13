import React, { useState, useMemo } from 'react';

const ALL_COLUMNS = [
    { key: 'name', label: 'Name' },
    { key: 'position', label: 'Pos' },
    { key: 'appearances', label: 'Apps' },
    { key: 'rating', label: 'Rating' },
    { key: 'goals', label: 'Goals' },
    { key: 'assists', label: 'Asst' },
    { key: 'expectedGoals', label: 'xG' },
    { key: 'scoringFrequency', label: 'Min/Goal' },
    { key: 'shotsOnTarget', label: 'SoT' },
    { key: 'accuratePasses', label: 'Ac. Passes' },
    { key: 'keyPasses', label: 'Key Passes' },
    { key: 'tackles', label: 'Tackles' },
    { key: 'interceptions', label: 'Interceptions' },
    { key: 'yellowCards', label: 'YC', isCard: true, color: '#FFD700' },
    { key: 'redCards', label: 'RC', isCard: true, color: '#FF0000' },
];

const PlayerStatsTable = ({ data }) => {
    // State to track sort key and direction
    const [sortConfig, setSortConfig] = useState({ key: 'position', direction: 'asc' });
    const [visibleColumns, setVisibleColumns] = useState([
        'name', 'position', 'appearances', 'rating', 'goals', 'expectedGoals', 'assists'
    ]);

    const positionOrder = { 'G': 1, 'D': 2, 'M': 3, 'F': 4 };

    const sortedPlayers = useMemo(() => {
        // Handle the null/error case inside the hook so it doesn't crash
        if (!data || !data.players || data.error) return [];

        let players = [...data.players];
        players.sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            if (sortConfig.key === 'position') {
                aValue = positionOrder[a[sortConfig.key]];
                bValue = positionOrder[b[sortConfig.key]];
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return players;
    }, [data, sortConfig]);

    // 2. NOW DEFINE HELPERS
    const toggleColumn = (key) => {
        // Prevent removing 'name'
        if (key === 'name') return;

        setVisibleColumns(prev =>
            prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
        );
    };

    const requestSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    // 3. EARLY RETURNS FOR UI (After all hooks are declared)
    if (!data || data.error) {
        return (
            <div className="stats-container error-state">
                <p>Stats currently unavailable for this team.</p>
            </div>
        );
    }

    return (
        <div className="stats-container">
            <h2>{data.teamName} Stats</h2>

            {/* Column Picker UI */}
            <div className="column-picker">
                {ALL_COLUMNS.map(col => (
                    <label className='column-picker-label' key={col.key}>
                        <input
                            type="checkbox"
                            checked={visibleColumns.includes(col.key)}
                            onChange={() => toggleColumn(col.key)}
                            // Disable the checkbox if it's the name column
                            disabled={col.key === 'name'}
                        />
                        {col.label}
                    </label>
                ))}
            </div>

            <table className='PlayerStatsTable'>
                <thead>
                    <tr>
                        {ALL_COLUMNS.filter(col => visibleColumns.includes(col.key)).map(col => (
                            <th key={col.key} onClick={() => requestSort(col.key)} style={{ cursor: 'pointer' }}>
                                {col.isCard ? (
                                    <span style={{ color: col.color }}>&#9632;</span>
                                ) : col.label}
                                {sortConfig.key === col.key ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedPlayers.map((player) => (
                        <tr key={player.id}>
                            {visibleColumns.includes('name') && <td className='PlayerName'><strong>{player.name}</strong></td>}
                            {visibleColumns.includes('position') && <td>{player.position}</td>}
                            {visibleColumns.includes('appearances') && <td>{player.appearances}</td>}
                            {visibleColumns.includes('rating') && (
                                <td className="rating-cell" style={{ color: getRatingColor(player.rating) }}>
                                    {player.rating.toFixed(2)}
                                </td>
                            )}
                            {visibleColumns.includes('goals') && <td>{player.goals}</td>}
                            {visibleColumns.includes('assists') && <td>{player.assists}</td>}
                            {visibleColumns.includes('expectedGoals') && <td>{player.expectedGoals.toFixed(1)}</td>}
                            {visibleColumns.includes('scoringFrequency') && <td>{player.scoringFrequency.toFixed(0)}</td>}
                            {visibleColumns.includes('shotsOnTarget') && <td>{player.shotsOnTarget}</td>}
                            {visibleColumns.includes('accuratePasses') && <td>{player.accuratePasses}</td>}
                            {visibleColumns.includes('keyPasses') && <td>{player.keyPasses}</td>}
                            {visibleColumns.includes('tackles') && <td>{player.tackles}</td>}
                            {visibleColumns.includes('interceptions') && <td>{player.interceptions}</td>}
                            {visibleColumns.includes('yellowCards') && <td>{player.yellowCards}</td>}
                            {visibleColumns.includes('redCards') && <td>{player.redCards}</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Helper to color-code ratings (e.g., green for 7+, red for <6)
const getRatingColor = (rating) => {
    if (rating >= 7) return '#01d613ff';
    if (rating >= 6.5) return '#f79000ff';
    return '#f0210aff';
};

export default PlayerStatsTable;