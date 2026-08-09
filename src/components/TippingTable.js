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
                const response = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_SERVER}leaderboard/${monthKey}`);
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
                    <h3>{monthName} {year}</h3>
                </div>
                <p className="leaderboard-hint">Select a tipster to open their record</p>
            </header>

            {data.length === 0 ? (
                <p className="leaderboard-empty">No tipsters on the board yet this month.</p>
            ) : (
                <div className="leaderboard-grid" role="table" aria-label={`${monthName} ${year} leaderboard`}>
                    <div className="leaderboard-cols leaderboard-cols-header" role="row">
                        <span role="columnheader">Rank</span>
                        <span role="columnheader">Tipster</span>
                        <span role="columnheader">Tips</span>
                        <span role="columnheader">ROI</span>
                        <span role="columnheader">Profit</span>
                    </div>

                    {data.map((row, index) => {
                        const isExpanded = expandedUserId === row.uid;
                        const rankClass = index < 3
                            ? `leaderboard-rank is-top is-rank-${index + 1}`
                            : 'leaderboard-rank';
                        const profitClass = row.monthlyProfit >= 0
                            ? 'leaderboard-profit is-positive'
                            : 'leaderboard-profit is-negative';
                        const profitPrefix = row.monthlyProfit > 0 ? '+' : '';

                        return (
                            <div key={row.uid} className="leaderboard-entry">
                                <div
                                    className={`leaderboard-cols leaderboard-row ${isExpanded ? 'active' : ''}`}
                                    role="row"
                                    tabIndex={0}
                                    aria-expanded={isExpanded}
                                    onClick={() => toggleExpand(row.uid)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            toggleExpand(row.uid);
                                        }
                                    }}
                                >
                                    <span className={rankClass} role="cell">{index + 1}</span>
                                    <span className="leaderboard-user" role="cell">
                                        <strong>{row.displayName}</strong>
                                        <span className="leaderboard-expand-cue" aria-hidden="true">
                                            {isExpanded ? '−' : '+'}
                                        </span>
                                    </span>
                                    <span className="leaderboard-metric" role="cell">{row.userSlips.length}</span>
                                    <span className="leaderboard-metric" role="cell">{row.roi.toFixed(1)}%</span>
                                    <span className={profitClass} role="cell">
                                        {profitPrefix}{row.monthlyProfit.toFixed(2)}
                                    </span>
                                </div>

                                {isExpanded && (
                                    <div className="expanded-tips-area">
                                        <div className="expanded-content-wrapper">
                                            <h4 className="expanded-header">{row.displayName} tip record</h4>
                                            <div className="mini-slips-list">
                                                {row.userSlips.map(slip => (
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

export default MonthlyLeaderboard;
