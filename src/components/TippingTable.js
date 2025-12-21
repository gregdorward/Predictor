import React, { useEffect, useState } from 'react';

const MonthlyLeaderboard = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    useEffect(() => {
        fetch(`${process.env.REACT_APP_EXPRESS_SERVER}leaderboard/${monthKey}`)
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    if (loading) return <div>Loading Leaderboard...</div>;

    return (
        <div className="leaderboard-container">
            <h3>December 2025 Leaderboard</h3>
            <table className="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>User</th>
                        <th>Resulted Tips</th>
                        <th>Strike rate</th>
                        <th>ROI</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={row.uid}>
                            <td>{index + 1}</td>
                            <td>{row.displayName}</td>
                            <td>{row.tipsCount}</td>
                            <td>
                                {row.tipsCount > 0
                                    ? `${((row.wins / row.tipsCount) * 100).toFixed(1)}%`
                                    : '0%'}
                            </td>
                            <td style={{ color: row.monthlyProfit >= 0 ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>
                                {row.tipsCount > 0
                                    ? `${((row.monthlyProfit / row.tipsCount) * 100).toFixed(1)}%`
                                    : '0%'}
                            </td>
                            <td style={{ color: row.monthlyProfit >= 0 ? 'green' : 'red' }}>
                                {row.monthlyProfit.toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MonthlyLeaderboard;