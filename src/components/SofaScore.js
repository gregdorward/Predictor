import React from "react";
import PropTypes from "prop-types";

const SofaLineupsWidget = ({ id, team1, team2, time, homeGoals, awayGoals }) => {
  const iframeSrc = `https://widgets.sofascore.com/embed/lineups?id=${id}&widgetTheme=light`;

  let differenceInSeconds, minutes
  const currentTime = new Date().getTime() / 1000;
  // Calculate the difference in seconds
    if(time > 0){
        differenceInSeconds = time - currentTime;
        minutes = Math.floor(differenceInSeconds / 60);
    } else {
        minutes = -99999999
    }



  if(team1 === "N/A") {
    return <h6>No lineups available for this match yet</h6>
  } else if (minutes > 60) {
    return (
      <div>
        <h6>Predicted lineups</h6>
        <iframe
          id={`sofa-lineups-embed-${id}`}
          src={iframeSrc}
          style={{
            height: "786px",
            maxWidth: "800px",
            width: "100%",
            border: "0",
          }}
          scrolling="no"
          title="SofaScore Lineups"
        ></iframe>
        <div
          style={{ fontSize: "12px", fontFamily: "Open Sans, sans-serif" }}
        ></div>
      </div>
    );
  } else if (minutes < 60 && minutes > 0) {
    return (
      <div>
        <h6>Lineups</h6>
        <iframe
          id={`sofa-lineups-embed-${id}`}
          src={iframeSrc}
          style={{
            height: "786px",
            maxWidth: "800px",
            width: "100%",
            border: "0",
          }}
          scrolling="no"
          title="SofaScore Lineups"
        ></iframe>
        <div
          style={{ fontSize: "12px", fontFamily: "Open Sans, sans-serif" }}
        ></div>
      </div>
    );
  } else if (minutes < 0) {
    return (
      <div>
        <div className="CurrentScore">Score: {`${team1}: ${homeGoals} - ${team2}: ${awayGoals}`}</div>
        <span>Score not live updated</span>
        <h6 className="AttackingMomentum">Live attacking momentum and goals</h6>
        <iframe
          width="100%"
          height="286"
          src={`https://widgets.sofascore.com/embed/attackMomentum?id=${id}&widgetTheme=light`}
          frameborder="0"
          scrolling="no"
        ></iframe>
        <div
          style={{ fontSize: "12px", fontFamily: "Open Sans, sans-serif" }}
        ></div>
        <h6>Lineups and in-play ratings</h6>
        <iframe
          id={`sofa-lineups-embed-${id}`}
          src={iframeSrc}
          style={{
            height: "786px",
            maxWidth: "800px",
            width: "100%",
            border: "0",
          }}
          scrolling="no"
          title="SofaScore Lineups"
        ></iframe>
        <div
          style={{ fontSize: "12px", fontFamily: "Open Sans, sans-serif" }}
        ></div>
      </div>
    );
  }
  else {
    return <h6>{`Lineups coming in approximately ${minutes - 60} minutes`}</h6>;
  }
};


SofaLineupsWidget.propTypes = {
  id: PropTypes.string.isRequired,
  team1: PropTypes.string.isRequired,
  team2: PropTypes.string.isRequired,
};

export default SofaLineupsWidget;
