import React, { useState, useEffect } from "react";
export const rounds = [
  {
    17: 61627,
    18: 61961,
    24: 61959,
    25: 61960,
    35: 63516,
    8: 61643,
    7: 61644,
    23: 63515,
    242: 70158,
    34: 61736,
  },
];


const TeamOfTheSeason = (props) => {
  const [roundId, setRoundId] = useState(null);
  const seasonId = 61627; // Update this dynamically if needed
  const id = props.id
  //WILL NEED TO BE UPDATED NEXT SEASON

  const baseUrl = `https://widgets.sofascore.com/embed/unique-tournament/${id}`;

  const derivedRoundId = (() => {
    for (const mapping of rounds) {
      if (mapping.hasOwnProperty(id)) {
        return mapping[id];
      }
    }
    console.warn(`No matching media ID found for ID: ${id}`);
    return null;
  })();

  console.log(id)
  console.log(derivedRoundId)

  useEffect(() => {
    const fetchRoundId = async () => {
      try {
        // Fetch rounds data to get the correct round ID
        const roundsResponse = await fetch(
          `${process.env.REACT_APP_EXPRESS_SERVER}round/${id}/${derivedRoundId}`
        );
        let roundsData = await roundsResponse.json();

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
  }, [id, roundId]);

  return (
    <div className="TeamOfTheSeason">
      {derivedRoundId ? (
        <iframe
          width="100%"
          height="523"
          // style={{ display: 'block', maxWidth: '700px' }}
          src={`${baseUrl}/season/${derivedRoundId}/round/${roundId}/teamOfTheWeek?widgetBackground=Gray&showCompetitionLogo=true&v=2`}
          frameBorder="0"
          scrolling="no"
          title="SofaScore Team of the Week"
        ></iframe>
      ) : (
        <p>Loading Team of the Week...</p>
      )}
      <div
        style={{
          fontSize: "12px",
          fontFamily: "Arial, sans-serif",
          textAlign: "left",
        }}
      >
      </div>
    </div>
  );
};

export default TeamOfTheSeason;
