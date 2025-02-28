import React, { useState, useEffect, Fragment, memo } from "react";
import ReactDOM from "react-dom";

async function addNewlinesAfterPeriods(text) {
    // This regex handles periods followed by a space and capital letter,
    // or periods immediately followed by a capital letter.  It also
    // avoids adding extra newlines.
    const regex = /\.(?=[A-Z]|\s[A-Z])/g;
  
    const newText = text.replace(regex, ".\n");
  
    return newText;
  }

function AIInsights({ game, homeForm, awayForm }) {
  const [aiMatchPreview, setAiMatchPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAIInsights = async () => {
      setIsLoading(true); // Set loading state
      setError(null); // Clear any previous errors

      const AIPayload = {
        league: game.leagueDesc,
        gameweek: game.game_week,
        homeTeamName: homeForm.teamName,
        homeLeaguePosition: homeForm.LeaguePosition,
        homeTeamResults: homeForm.allTeamResults,
        awayTeamName: awayForm.teamName,
        awayLeaguePosition: awayForm.LeaguePosition,
        awayTeamResults: awayForm.allTeamResults,
      };

      try {
        const response = await fetch(
          `${process.env.REACT_APP_EXPRESS_SERVER}gemini/${game}`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(AIPayload),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const jsonData = await response.json();
        const formattedText = await addNewlinesAfterPeriods(
          jsonData.matchPreview
        );
        setAiMatchPreview({ ...jsonData, matchPreview: formattedText });
      } catch (err) {
        setError(err);
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false); // Clear loading state
      }
    };

    fetchAIInsights();
  }, [JSON.stringify(game), JSON.stringify(homeForm), JSON.stringify(awayForm)]); // Dependencies: re-fetch when these change. Game and Home Form MUST be added as dependancies.

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!aiMatchPreview) {
    return null; // Or some placeholder content if no data yet
  }

  return (
    <Fragment>
      <h2>Preview</h2>
      <div className="AIMatchPreview">{aiMatchPreview.matchPreview}</div>
      <h2>AI Prediction</h2>
      <div className="AIMatchPreview">
        {aiMatchPreview.prediction} <i>(may not reflect the view of XGTipping)</i>
      </div>
      <div className="AIContainer">
        <div className="HomeAIInsights">
          <div>{aiMatchPreview.homeTeam.summary}</div>
        </div>
        <div className="AwayAIInsights">
          <div>{aiMatchPreview.awayTeam.summary}</div>
        </div>
      </div>
    </Fragment>
  );
}

const MemoizedAIInsights = memo(AIInsights);

// Modified generateAIInsights function (now just renders the component)
export function generateAIInsights(game, homeForm, awayForm) {
  ReactDOM.render(
    <React.StrictMode>
    <MemoizedAIInsights game={game} homeForm={homeForm} awayForm={awayForm} />
    </React.StrictMode>,
    document.getElementById("AIInsightsContainer")
  );
}