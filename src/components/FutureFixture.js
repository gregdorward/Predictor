import React from "react";

export function FutureFixture(props) {
    return (
        <div
            id="FutureFixture"
            className="FutureFixture"
            style={{
                borderTop: `4px solid ${props.colourOne}`,
            }}
        >
            <ul>
                <li>{props.homeTeam}</li>
                <li>{props.awayTeam}</li>
                <li>{props.competition}</li>
                <li>{props.date}</li>
            </ul>
        </div>
    );
}
