import { useState, useEffect } from "react";
import { allLeagueResultsArrayOfObjects } from "../logic/getFixtures";
import { renderTable } from "../logic/getFixtures";


const sofaScoreIds = [
  // { 12325: 17 }, //EPL
  // { 12451: 18 }, //Championship
  // { 12446: 24 }, //League 1
  // { 12422: 25 }, //League 2
  // { 12529: 35 }, //Bundesliga
  // { 12316: 8 }, //La Liga
  { 12321: 7 }, //Champions League
  { 13734: 10783 }, //Nations league 24/25
  { 13878: 357 }, // Club World Cup 25
    { 13974: 384 }, // Copa Libertadores 25

  // { 12530: 23 }, //Serie A

  // { 12337: 34 }, //Ligue 1,
  // { 12455: 36 }, //Scottish Prem
  // { 12931: 44 }, //Portugal
  // { 12322: 35 }, //Dutch
  // { 12137: 38 }, //Belgium
  { 13963: 40 }, //Sweden
  { 12132: 39 }, //Denmark
  { 13987: 20 }, //Norway
  { 12472: 45 }, //Austrian Prem 22/23
  // { 12734: 185 }, //Greek Prem 22/23
  // { 12641: 52 }, //turkey
  { 12120: 202 }, //Polish prem 22/23
  { 12326: 215 }, //Swiss prem 22/23
  { 12121: 170 }, //Croatia 24/25
  { 12336: 172 }, //Czecjh 24/25

  { 14089: 41 }, // Finland 25
  { 12483: 218 }, // Ulraine 25
  { 12138: 210 }, // Serbia 25
  { 12476: 212 }, // Slovenia 25
  { 12944: 211 }, // Slovakia 25

  { 13952: 192 }, //Irish Prem
  { 13703: 136 }, //Aus A League
  { 12327: 679 }, //Europa
  { 12278: 17015 }, //Europa Conference
  // { 12467: 54 }, //Spanish secunda 22/23
  // { 12621: 53 }, //Italy serie B 22/23
  // { 12528: 44 }, //Bundesliga 2 22/23
  // { 12338: 182 }, //French League 2 22/23
  // { 12456: 206 }, //Scottish Championship 22/23
  // { 12474: 207 }, //Scottish league 1 22/23
  // { 12453: 209 }, //Scottish league 2 22/23
    { 13973: 242 }, //MLS
  { 13967: 13363 }, // USL
  { 14236: 13470 }, //Canada 25
  { 14231: 325 }, //Brazil prem 24
  { 14125: 155 }, //Argentina prem 23
  { 14086: 11539}, //Colombia 25
  // { 12136: 11621 }, //Mexico prem 23/24
  { 12622: 173 }, //National league
  // { 12933: 176 }, //National league North and South 22/23
  { 14069: 410 }, //S Korea 25,
  { 13960: 196 }, //Japan 25
  { 12772: 955 }, //Saudi 24/25
  { 13964: 11}, // World Cup 26 EU Qualifiers
  { 10121: 295 }, // World Cup 26 SA Qualifiers

  // 11426, // WC Qual ConCaf
  // 12801
];


export default function LeagueName({ fixture, mock, showShortlist }) {
  const [logoUrl, setLogoUrl] = useState(null);

  const name = fixture.leagueName;
  const id =
    allLeagueResultsArrayOfObjects.length > 0
      ? allLeagueResultsArrayOfObjects[fixture.leagueIndex].id
      : null;

  useEffect(() => {
    async function fetchLogo() {
      const found = sofaScoreIds.find((obj) => obj[id] !== undefined);
      const value = found ? found[id] : null;
      if (!value) return;

      const logoPath = `${process.env.REACT_APP_EXPRESS_SERVER}logo/${value}`;
      try {
        // Optionally verify it loads first
        const response = await fetch(logoPath);
        if (response.ok) {
          setLogoUrl(logoPath); // Use the URL directly
        } else {
          console.error("Failed to fetch logo URL:", response.status);
        }
      } catch (error) {
        console.error("Error fetching logo URL:", error);
      }
      fixture.sofaScoreId = value
    }

    fetchLogo();
  }, [id]);

  if (mock === true || name === null) {
    return <div></div>;
  }

  return (
    <div>
      <div
        className="leagueName"
        id={`league${id}`}
        key={`leagueName${id}div`}
        onClick={() =>
          renderTable(
            fixture.leagueIndex,
            allLeagueResultsArrayOfObjects[fixture.leagueIndex],
            id
          )
        }
        style={{ display: "flex", alignItems: "center" }}
      >
        <div className="LeagueAndLogo">
          {logoUrl && (
            <img
              className="LeagueLogo"
              src={logoUrl}
              alt={`${name} Logo`}
            />
          )}
          {showShortlist ? fixture.leagueDesc : fixture.leagueName} &#9776;
        </div>
      </div>

      <div
        className="LeagueTable"
        key={`leagueName${id}`}
        id={`leagueName${id}`}
      ></div>
    </div>
  );
}
