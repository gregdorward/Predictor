import React, { useState, useEffect } from 'react';

const TeamOfTheSeason = () => {
  const [roundId, setRoundId] = useState(null);
  const seasonId = 61627; // Update this dynamically if needed
  const baseUrl = "https://widgets.sofascore.com/embed/unique-tournament/17";

  useEffect(() => {
    const fetchRoundId = async () => {
      try {
        
        // Fetch rounds data to get the correct round ID
        const roundsResponse = await fetch(
          `https://www.sofascore.com/api/v1/unique-tournament/17/season/${seasonId}/team-of-the-week/rounds`
        );
        const roundsData = await roundsResponse.json();

        // Get the round ID from the first round in the data
        if (roundsData.rounds?.length > 0) {
          const firstRoundId = roundsData.rounds[0]?.id; // Grabbing the id from index 0
          setRoundId(firstRoundId); // Set the roundId state
        } else {
          console.error("No rounds data found.");
        }
      } catch (error) {
        console.error("Error fetching SofaScore API:", error);
      }
    };

    fetchRoundId();
  }, [seasonId]);

  return (
    <div className='TeamOfTheSeason'>
      {roundId ? (
        <iframe
          width="100%"
          height="523"
          // style={{ display: 'block', maxWidth: '700px' }}
          src={`${baseUrl}/season/${seasonId}/round/${roundId}/teamOfTheWeek?widgetBackground=Gray&showCompetitionLogo=true&widgetTitle=Premier%20League&v=2`}
          frameBorder="0"
          scrolling="no"
          title="SofaScore Team of the Week"
        ></iframe>
      ) : (
        <p>Loading Team of the Week...</p>
      )}
      <div style={{ fontSize: '12px', fontFamily: 'Arial, sans-serif', textAlign: 'left' }}>
        <a target="_blank" href="https://www.sofascore.com/" rel="noreferrer">
          Team of the Week provided by SofaScore
        </a>
      </div>
    </div>
  );
};

export default TeamOfTheSeason;
