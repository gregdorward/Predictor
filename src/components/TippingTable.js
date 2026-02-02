import React, { useEffect, useState } from 'react';
import { BetSlipItem } from '../logic/getScorePredictions'; 

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

                const merged = lbJson.map(user => {
                    const userSlips = slips.filter(s => s.uid === user.uid);
                    
                    // 1. Calculate Total Staked for settled/active bets to use as ROI divisor
                    const totalStaked = userSlips.reduce((sum, s) => sum + (Number(s.stake) || 0), 0);
                    
                    // 2. Calculate ROI safely
                    // Formula: (Profit / Total Stake) * 100
                    const roiValue = totalStaked > 0 ? (user.monthlyProfit / totalStaked) * 100 : 0;

                    const sortedUserSlips = [...userSlips].sort((a, b) => 
                        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
                    );

                    return {
                        ...user,
                        userSlips: sortedUserSlips,
                        roi: isFinite(roiValue) ? roiValue : 0 // Final safety check
                    };
                })
                // 3. Filter: Only show users who have actually submitted slips
                .filter(user => user.userSlips.length > 0)
                .sort((a, b) => b.monthlyProfit - a.monthlyProfit); 

                setData(merged);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching leaderboard:", err);
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [monthKey, slips]);

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
                                {/* Use the pre-calculated ROI from the merged object */}
                                <td>{row.roi.toFixed(1)}%</td>
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
                                                {row.userSlips.map(slip => (
                                                    <BetSlipItem key={slip.slipId} slip={slip} />
                                                ))}
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