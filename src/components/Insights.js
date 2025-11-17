import React from 'react';
import Collapsable from "./CollapsableElement"

/**
 * A helper component to render a single list of stats.
 * It sorts the items, slices the top 10, and maps them.
 */
const scrollToTarget = (id) => {
    // Use a small timeout to ensure the DOM element exists after async load
    setTimeout(() => {
        const targetElement = document.getElementById(id);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, 0);
};

const StatList = ({ title, sub, items, operator, sortOrder = 'desc', limit = 10 }) => {
    // Sort items
    const sortedItems = [...items].sort((a, b) =>
        sortOrder === 'desc' ? b.score - a.score : a.score - b.score
    );

    // Apply limit (default 10)
    const list = sortedItems.slice(0, limit);

    return (
        <div className="InsightContainer">
            <h2>{title}</h2>
            <h6>{sub}</h6>
            {!items || items.length === 0 && <li>No data available.</li>}

            <ul>
                {list.map((item, index) => (
                    <li key={index} className="InsightListItem">
                        <div className='InsightScore'>
                            <span className='InsightIndex'>{index + 1}</span> {`${item.name}: `}
                            <span className='InsightScoreValue'>{`${item.score.toFixed(2)}${operator}`}</span>
                        </div>

                        <a
                            href={`#${item.gameId}`}
                            className='InsightGame'
                            onClick={(e) => {
                                e.preventDefault();
                                scrollToTarget(item.gameId);
                            }}
                        >
                            {item.game}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

/**
 * Main component to render all the sorted insight lists.
 */
export const InsightsPanel = ({ statsArray, paidUser }) => {
    if (!statsArray) return <div className="p-4">Loading insights...</div>;

    return (
        <div>
            <Collapsable
                buttonText={"Best value performers"}
                classNameButton="BestValueCollapsable"
                element={
                    <>
                        <StatList
                            title="Best betting value"
                            sub="Points difference from bookies' expectations (last 5)"
                            operator=""
                            items={statsArray.trueFormArray}
                            sortOrder="desc"
                            limit={paidUser ? 10 : 5}
                        />

                        {!paidUser && (
                            <div className="PaidFeatureNotice">
                                Showing top 5 only — Top 10 available to paid users.
                            </div>
                        )}
                    </>
                }
            />
            <Collapsable
                buttonText={"Worst value performers"}
                classNameButton="BestValueCollapsable"
                element={
                    <>
                        <StatList
                            title="Worst betting value"
                            sub="Points difference from bookies' expectations (last 5)"
                            operator=""
                            items={statsArray.trueFormArray}
                            sortOrder="asc" // Lowest score is worst
                        />
                        {!paidUser && (
                            <div className="PaidFeatureNotice">
                                Showing top 5 only — Top 10 available to paid users.
                            </div>
                        )}
                    </>
                }
            />
            <Collapsable
                buttonText={"Best XG difference"}
                classNameButton="BestValueCollapsable"
                element={
                    <>
                        <StatList
                            title="Best XG Difference"
                            sub="XG goal difference (last 5)"
                            operator=""
                            items={statsArray.XGDiffArray}
                            sortOrder="desc"
                            limit={paidUser ? 10 : 5}
                        />
                        {!paidUser && (
                            <div className="PaidFeatureNotice">
                                Showing top 5 only — Top 10 available to paid users.
                            </div>
                        )}
                    </>
                }
            />
            <Collapsable
                buttonText={"Best goal difference"}
                classNameButton="BestValueCollapsable"
                element={
                    <StatList
                        title="Best Goal Difference"
                        sub="Goal difference (last 5)"
                        operator=""
                        items={statsArray.goalDiffArray}
                        sortOrder="desc"
                        limit={paidUser ? 10 : 5}
                    />
                }
            />
            <Collapsable
                buttonText={"Most SOT"}
                classNameButton="BestValueCollapsable"
                element={
                    <>
                        <StatList
                            title="Most Shots on Target"
                            sub="Average shots on target (last 5)"
                            operator=""

                            items={statsArray.sotArray}
                            sortOrder="desc"
                            limit={paidUser ? 10 : 5}

                        />
                        {!paidUser && (
                            <div className="PaidFeatureNotice">
                                Showing top 5 only — Top 10 available to paid users.
                            </div>
                        )}
                    </>
                }
            />
            <Collapsable
                buttonText={"Most BTTS games"}
                classNameButton="BestValueCollapsable"
                element={
                    <>
                        <StatList
                            title="Best for BTTS"
                            sub="Percentage of games ending in BTTS (last 5)"
                            operator="%"
                            items={statsArray.bttsArray}
                            sortOrder="desc"
                            limit={paidUser ? 10 : 5}

                        />
                        {!paidUser && (
                            <div className="PaidFeatureNotice">
                                Showing top 5 only — Top 10 available to paid users.
                            </div>
                        )}
                    </>
                }
            />
            <Collapsable
                buttonText={"Most corners"}
                classNameButton="BestValueCollapsable"
                element={
                    <>
                        <StatList
                            title="Most Corners"
                            sub="Average corners (last 5)"
                            operator=""
                            items={statsArray.cornersArray}
                            sortOrder="desc"
                            limit={paidUser ? 10 : 5}
                        />
                        {!paidUser && (
                            <div className="PaidFeatureNotice">
                                Showing top 5 only — Top 10 available to paid users.
                            </div>
                        )}
                    </>
                }
            />
            <Collapsable
                buttonText={"Most cards"}
                classNameButton="BestValueCollapsable"
                element={
                    <>
                        <StatList
                            title="Most Cards"
                            sub="Cards (all games)"
                            operator=""
                            items={statsArray.cardsArray}
                            sortOrder="desc"
                            limit={paidUser ? 10 : 5}
                        />
                        {!paidUser && (
                            <div className="PaidFeatureNotice">
                                Showing top 5 only — Top 10 available to paid users.
                            </div>
                        )}
                    </>

                }
            />
        </div>
    );
};