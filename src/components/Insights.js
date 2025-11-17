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

const StatList = ({ title, sub, items, operator, sortOrder = 'desc' }) => {
    // Sort items: 'desc' (highest first) or 'asc' (lowest first)
    const sortedItems = [...items].sort((a, b) =>
        sortOrder === 'desc' ? b.score - a.score : a.score - b.score
    );

    // Get top 10
    const list = sortedItems.slice(0, 10);


    return (
        <div className="InsightContainer">
            <h2>{title}</h2>
            <h6>{sub}</h6>
            <ul>
                {list.length > 0 ? (
                    list.map((item, index) => (
                        <li key={index} className="InsightListItem">
                            <div className='InsightScore'>
                                <span className='InsightIndex'>{`${index + 1}`}</span> {`${item.name}: `} <span className='InsightScoreValue'>{`${item.score.toFixed(2)}${operator}`}</span>
                            </div>
                            <a href={`#${item.gameId}`} className='InsightGame'
                                onClick={(e) => {
                                    e.preventDefault(); // Prevent the immediate jump/reload
                                    scrollToTarget(item.gameId); // Call the custom smooth scroll function
                                }}
                            >
                                {item.game}
                            </a>
                        </li>

                    ))
                ) : (
                    <li>No data available.</li>
                )}
            </ul>
        </div>
    );
};

/**
 * Main component to render all the sorted insight lists.
 */
export const InsightsPanel = ({ statsArray }) => {
    if (!statsArray) return <div className="p-4">Loading insights...</div>;

    return (
        <div>
            <Collapsable
                buttonText={"Best value performers"}
                classNameButton="BestValueCollapsable"
                element={
                    <StatList
                        title="Best value teams"
                        sub="Points difference from bookies' expectations (last 5)"
                        operator=""
                        items={statsArray.trueFormArray}
                        sortOrder="desc" // Highest score is best
                    />
                }
            />
            <Collapsable
                buttonText={"Worst value performers"}
                classNameButton="BestValueCollapsable"
                element={
                    <StatList
                        title="Worst value teams"
                        sub="Points difference from bookies' expectations (last 5)"
                        operator=""
                        items={statsArray.trueFormArray}
                        sortOrder="asc" // Lowest score is worst
                    />
                }
            />
            <Collapsable
                buttonText={"Best XG performers"}
                classNameButton="BestValueCollapsable"
                element={
                    <StatList
                        title="Best xG Differential"
                        sub="XG goal difference (last 5)"
                        operator=""
                        items={statsArray.XGDiffArray}
                        sortOrder="desc"
                    />
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
                    />
                }
            />
            <Collapsable
                buttonText={"Most SOT"}
                classNameButton="BestValueCollapsable"
                element={
                    <StatList
                        title="Most Shots on Target"
                        sub="Average shots on target (last 5)"
                        operator=""

                        items={statsArray.sotArray}
                        sortOrder="desc"
                    />
                }
            />
            <Collapsable
                buttonText={"Most BTTS games"}
                classNameButton="BestValueCollapsable"
                element={
                    <StatList
                        title="Best for BTTS"
                        sub="Percentage of games ending in BTTS (last 5)"
                        operator="%"
                        items={statsArray.bttsArray}
                        sortOrder="desc"
                    />
                }
            />
            <Collapsable
                buttonText={"Most corners"}
                classNameButton="BestValueCollapsable"
                element={
                    <StatList
                        title="Most Corners"
                        sub="Average corners (last 5)"
                        operator=""
                        items={statsArray.cornersArray}
                        sortOrder="desc"
                    />
                }
            />
                        <Collapsable
                buttonText={"Most cards"}
                classNameButton="BestValueCollapsable"
                element={
                    <StatList
                        title="Most Cards"
                        sub="Cards (all games)"
                        operator=""
                        items={statsArray.cardsArray}
                        sortOrder="desc"
                    />
                }
            />
        </div>
    );
};