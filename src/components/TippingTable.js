import React, { useEffect, useState } from 'react';
import {BetSlipItem} from '../logic/getScorePredictions'; // Ensure this matches your component's export

const MonthlyLeaderboard = ({ slips = [] }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedUserId, setExpandedUserId] = useState(null);

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthName = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();

    const toggleExpand = (uid) => {
        setExpandedUserId(expandedUserId === uid ? null : uid);
    };

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}leaderboard/${monthKey}`);
                const lbJson = await response.json();

                console.log("Fetched leaderboard data:", lbJson);
                // MERGE: Map the passed 'slips' prop to the leaderboard users
                const merged = lbJson.map(user => {
                    // Filter slips for this specific user
                    const userSlips = slips.filter(s => s.uid === user.uid);
                    
                    // SORT: Ensure the tips inside the accordion are newest first
                    const sortedUserSlips = [...userSlips].sort((a, b) => 
                        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
                    );

                    return {
                        ...user,
                        userSlips: sortedUserSlips
                    };
                })
                .filter(user => user.userSlips.length > 0)
                .sort((a, b) => b.monthlyProfit - a.monthlyProfit); // Keep leaderboard sorted by profit

                setData(merged);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching leaderboard:", err);
                setLoading(false);
            }
        };

        // Only fetch if we have slips data (or handle empty state)
        fetchLeaderboard();
    }, [monthKey, slips]); // Re-run if month changes or slips prop updates

    if (loading) return <div className="leaderboard-loading">Loading Leaderboard...</div>;

    return (
        <div className="leaderboard-container">
            <h3>{monthName} {year} Leaderboard</h3>
            <table className="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>User</th>
                        <th>Tips</th>
                        <th>ROI</th>
                        <th>Profit</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <React.Fragment key={row.uid}>
                            <tr
                                onClick={() => toggleExpand(row.uid)}
                                className={`leaderboard-row ${expandedUserId === row.uid ? 'active' : ''}`}
                            >
                                <td>{index + 1}</td>
                                <td>
                                    <strong>{row.displayName}</strong>
                                </td>
                                <td>{row.userSlips.length}</td>
                                <td>{((row.monthlyProfit / row.tipsCount) * 100 || 0).toFixed(1)}%</td>
                                <td style={{ 
                                    color: row.monthlyProfit >= 0 ? '#4caf50' : '#f44336',
                                    fontWeight: 'bold' 
                                }}>
                                    {row.monthlyProfit.toFixed(2)}
                                </td>
                            </tr>

                            {expandedUserId === row.uid && (
                                <tr className="expanded-tips-area">
                                    <td colSpan="5">
                                        <div className="expanded-content-wrapper">
                                            <h4 className="expanded-header">{row.displayName} Tip Record</h4>
                                            <div className="mini-slips-list">
                                                {row.userSlips.length > 0 ? (
                                                    row.userSlips.map(slip => (
                                                        <BetSlipItem key={slip.slipId} slip={slip} />
                                                    ))
                                                ) : (
                                                    <p className="no-tips-msg">No tips found for this month.</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MonthlyLeaderboard;