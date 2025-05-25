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
    37: 61666, // dutch
    9: 61412, // belgium
    40: 69956, // sweden
    39: 61326, // denmark
    20: 70174, // Norway
    45: 62629, // Austria
    185: 64052, // Greece
    52: 63814, // Turkey
    202: 61236, // Poland
    215: 61658, // Switz
    170: 61243, // Croatia
    172: 61716, // Czech
    192: 69981, // Ireland
    357: 69619, // Club World Cup
    54: 62048, // Spanish Secunda
    53: 63812, // Serie B
    325: 72034, // Brazil
    155: 70268, // Argentina
    44 : 63514, // Bundesliga 2
    182 : 61737, // Ligue 2
    36 : 62408, // Scottish Prem
    206 : 62411, // Scottish Champ
    207 : 62416, // Scottish league one
    209 : 62487, // Scottish league two
    13470 : 72315, // Canada
    11621 : 61419, // Liga MX
    173 : 63807, // English National League
    176 : 63806, // National League North
    174 :63803, // National League South
    136 : 64864, // A League
    410 : 70830, // South korea
    196 : 69871, // J League
    955 : 63998, // Saudi Pro League
    11 : 69427, // World cup EU
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
          height="700"
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
