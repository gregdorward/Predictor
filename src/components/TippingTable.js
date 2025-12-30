import React, { useEffect, useState } from 'react';

const MonthlyLeaderboard = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const monthName = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();

    useEffect(() => {
        fetch(`${process.env.REACT_APP_EXPRESS_SERVER}leaderboard/${monthKey}`)
            .then(res => res.json())
            .then(json => {
                // --- SORTING LOGIC BY PROFIT/LOSS ---
                const sortedData = json.sort((a, b) => {
                    // Sort by monthlyProfit (Descending)
                    // If profit is equal, we can use tipsCount as a secondary tie-breaker
                    return b.monthlyProfit - a.monthlyProfit;
                });

                setData(sortedData);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, [monthKey]);

    if (loading) return <div>Loading Leaderboard...</div>;

    return (
        <div className="leaderboard-container">
            <h3>{monthName} {year} Leaderboard</h3>
            <div>Each participant started on a balance of 50 units</div>            
            <table className="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>User</th>
                        <th>Resulted Tips</th>
                        <th>Strike rate</th>
                        <th>ROI</th>
                        <th>Current Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => {
                        const strikeRate = row.tipsCount > 0
                            ? ((row.wins / row.tipsCount) * 100).toFixed(1)
                            : '0';
                        const roi = row.tipsCount > 0
                            ? ((row.monthlyProfit / row.tipsCount) * 100).toFixed(1)
                            : '0';

                        return (
                            <tr key={row.uid}>
                                <td>{index + 1}</td>
                                <td>{row.displayName}</td>
                                <td>{row.tipsCount}</td>
                                <td>{strikeRate}%</td>
                                <td style={{
                                    color: parseFloat(roi) >= 0 ? '#4caf50' : '#f44336',
                                    fontWeight: 'bold'
                                }}>
                                    {roi}%
                                </td>
                                <td style={{
                                    color: row.currentBalance >= 50 ? '#4caf50' : '#f44336',
                                    fontWeight: 'bold'
                                }}>
                                    {row.currentBalance.toFixed(2)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default MonthlyLeaderboard;