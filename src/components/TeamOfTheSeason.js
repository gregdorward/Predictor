import React, { useState, useEffect } from "react";
//tournaments/search (Deprecated)
//Use ID to call tournaments/get-seasons

// const footyStatsToSofaScore = [
//   {
//     //Prem 25
//     15050: {
//       id: 17,
//       season: 76986,
//     },
//     //Championship 25
//     14930: {
//       id: 18,
//       season: 77347,
//     },
//     //League 1
//     14934: {
//       id: 24,
//       season: 77352,
//     },
//     //League 2
//     14935: {
//       id: 25,
//       season: 77351,
//     },
//     12622: {
//       id: 173,
//       season: 63807, // Conference 24/25
//     },
//     //Bundesliga
//     14968: {
//       id: 35,
//       season: 77333,
//     },
//     //La Liga 25
//     14956: {
//       id: 8,
//       season: 77559,
//     },
//     15000: {
//       id: 36,
//       season: 77128, // Scottish Premiership 25
//     },
//     //Champions league 25
//     14924: {
//       id: 7,
//       season: 76953,
//     },
//     //Serie A 25
//     15068: {
//       id: 23,
//       season: 76457,
//     },
//     //MLS
//     13973: {
//       id: 242,
//       season: 70158,
//     },
//     //Ligue 1 25
//     14932: {
//       id: 34,
//       season: 77356,
//     },
//     15115: {
//       id: 238,
//       season: 77806, // Portuguese Primeira Liga 25
//     },
//     13974: {
//       id: 384,
//       season: 70083, // Copa Libertadores
//     },
//     14936: {
//       id: 37,
//       season: 77012, // Eredivisie
//     },
//     14937: {
//       id: 9,
//       season: 77849, // Belgian Pro League
//     },
//     13963: {
//       id: 40,
//       season: 69956, // Scottish Premiership
//     },
//     15055: {
//       id: 39,
//       season: 76491, // Danish Superliga
//     },
//     13987: {
//       id: 20,
//       season: 70174, // Norwegian Eliteserien
//     },
//     14923: {
//       id: 45,
//       season: 77382, // Austrian Bundesliga
//     },
//     15163: {
//       id: 185,
//       season: 78175, // Greek Super League
//     },
//     14972: {
//       id: 52, // Turkish Super Lig
//       season: 78175,
//     },
//     15031: {
//       id: 202,
//       season: 76477, // Ekstraklasa
//     },
//     15066: {
//       id: 54,
//       season: 77558, // Spanish Segunda Division
//     },
//     14931: {
//       id: 44,
//       season: 77354, // Bundesliga 2
//     },
//     14954: {
//       id: 182,
//       season: 77357, // French Ligue 2
//     },
//     15061: {
//       id: 206,
//       season: 77037, // Scottish Championship 25
//     },
//     15062: {
//       id: 207,
//       season: 77037, // Scottish League One 25
//     },
//     15064: {
//       id: 209,
//       season: 77045, // Scottish League Two 25
//     },
//     15047: {
//       id: 215,
//       season: 77152, // Swiss Super League
//     },
//     15053: {
//       id: 170,
//       season: 77152, // Croatian First League
//     },
//     14973: {
//       id: 172,
//       season: 77019, // Czech First League
//     },
//     14089: {
//       id: 41,
//       season: 70853, // Finnish Veikkausliiga
//     },
//     14951: {
//       id: 218,
//       season: 77625, // Ukrainian Premier League
//     },
//     15063: {
//       id: 212,
//       season: 62660, // Slovenian Prva Liga
//     },
//     14933: {
//       id: 211,
//       season: 77154, // Slovak Super Liga
//     },
//     15065: {
//       id: 210,
//       season: 77625, // Serbian SuperLiga 
//     },
//     15234: {
//       id: 11621,
//       season: 76500, // Liga MX 25
//     },
//     14231: {
//       id: 325,
//       season: 72034, // Brazil Serie A
//     },
//     14305: {
//       id: 390,
//       season: 72603, // Brazil Serie B
//     },
//     13878: {
//       id: 357,
//       season: 69619, // Club World Cup
//     },
//     13734: {
//       id: 10783,
//       season: 58337, // UEFA Nations League 25
//     },
//     14086: {
//       id: 11539,
//       season: 70681, // Colombian Liga BetPlay 25
//     },
//     14626: {
//       id: 278,
//       season: 71306, // Uruguayan Primera Division 25
//     },
//     15310: {
//       id: 155,
//       season: 70268, // Argentina Primera Division 25
//     },
//     13960: {
//       id: 196,
//       season: 69871, // J League 25
//     },
//     14069: {
//       id: 410,
//       season: 70830, // K League 25
//     },
//     12772: {
//       id: 955,
//       season: 63998, // Saudi Pro League 24/25
//     },
//     13967: {
//       id: 13363,
//       season: 70263 // USL 25
//     },
//     14236: {
//       id: 13470,
//       season: 72315 // Canadian Premier League 25
//     },
//     13964: {
//       id: 11,
//       season: 69427, // World Cup EU 2026
//     },
//     10121: {
//       id: 295,
//       season: 53820, // World Cup SA 2026
//     },
//     13952: {
//       id: 192,
//       season: 69981, // Ireland 24/25
//     },
//     13703: {
//       id: 136,
//       season: 64864, // A League 24/25
//     },
//     15002: {
//       id: 679,
//       season: 76984, // UEFA Europa League 25
//     },
//     14904: {
//       id: 17015,
//       season: 76960, // UEFA Europa Conference League 24/25
//     },
//   },
// ];


export const rounds = [
  {
    17: 76986,
    18: 77347,
    24: 77352,
    25: 77351,
    173: 63807,
    174: 78227,
    176: 78282,
    35: 77333,
    8: 77559,
    36: 77128,
    7: 76953,
    23: 76457,
    242: 70158,
    34: 77356,
    238: 77806,
    384: 70083,
    37: 77012,
    9: 77849,
    40: 69956,
    39: 76491,
    20: 70174,
    45: 77382,
    185: 78175,
    52: 78175,
    202: 76477,
    54: 77558,
    44: 77354,
    182: 77357,
    206: 77037,
    207: 77037,
    209: 77045,
    215: 77152,
    170: 77152,
    172: 77019,
    41: 70853,
    218: 77625,
    212: 62660,
    131: 77156,
    211: 77154,
    210: 77625,
    11621: 76500,
    325: 72034,
    390: 72603,
    357: 69619,
    10783: 58337,
    11539: 70681,
    278: 71306,
    155: 70268,
    196: 69871,
    410: 70830,
    955: 63998,
    13363: 70263,
    13470: 72315,
    11: 69427,
    295: 53820,
    192: 69981,
    136: 64864,
    679: 76984,
    17015: 76960,
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
