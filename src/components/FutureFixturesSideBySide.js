import React from "react";
import Collapsable from "./CollapsableElement"; // adjust import path if needed
import { FutureFixture } from "./FutureFixture"; // adjust import path if needed

export default function FutureFixturesSideBySide({
    loadingFutureFixtures,
    futureFixturesHome = [],
    futureFixturesAway = [],
}) {
    // if still loading or both empty, render the same empty <div></div> logic you used
    if (loadingFutureFixtures || (futureFixturesHome.length === 0 && futureFixturesAway.length === 0)) {
        return <div></div>;
    }

    return (

        <div
            className="FutureFixturesSideBySide"
        >
            {/* Home column */}
            <div
                className="FutureFixturesColumn FutureFixturesHome"
            >
                {futureFixturesHome.length === 0 ? (
                    <div>No upcoming fixtures</div>
                ) : (
                    <div className="FutureFixtures">
                        {futureFixturesHome.map((fixture, index) => (
                            <FutureFixture
                                key={fixture.id ?? index}
                                competition={fixture.tournamentName}
                                homeTeam={fixture.homeTeam}
                                awayTeam={fixture.awayTeam}
                                date={fixture.date}
                                time={fixture.time}
                                colourOne={fixture.colourOne}
                                colourTwo={fixture.colourTwo}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Away column */}
            <div
                className="FutureFixturesColumn FutureFixturesAway"
            >
                {futureFixturesAway.length === 0 ? (
                    <div>No upcoming fixtures</div>
                ) : (
                    <div className="FutureFixtures">
                        {futureFixturesAway.map((fixture, index) => (
                            <FutureFixture
                                key={fixture.id ?? index}
                                competition={fixture.tournamentName}
                                homeTeam={fixture.homeTeam}
                                awayTeam={fixture.awayTeam}
                                date={fixture.date}
                                time={fixture.time}
                                colourOne={fixture.colourOne}
                                colourTwo={fixture.colourTwo}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
