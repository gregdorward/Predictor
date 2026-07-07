import { useState, useEffect } from "react";
import { allLeagueResultsArrayOfObjects } from "../logic/getFixtures";
import { renderTable } from "../logic/getFixtures";
import {
  getLeagueFixturesByLeagueId,
  getLeagueResultsByLeagueId,
} from "../utils/leagueResultsAccess";
import { getStoredTheme } from "../utils/theme";
import { getCompetitionUrl } from "../seo/competitionCatalog";
import { sofaScoreIds as sofaScoreIdMap } from "../constants/sofaScoreIds";


// Ids to be updated for the latest season
const sofaScoreIds = sofaScoreIdMap;

export default function LeagueName({ fixture, mock, showShortlist }) {
  const [logoUrl, setLogoUrl] = useState(null);

const name = showShortlist ? fixture.leagueDesc : fixture.leagueName;
  const id =
    fixture.leagueID ??
    allLeagueResultsArrayOfObjects[fixture.leagueIndex]?.id ??
    null;
  const leagueResults = getLeagueResultsByLeagueId(
    allLeagueResultsArrayOfObjects,
    id
  );

  useEffect(() => {
    async function fetchLogo() {
      const found = sofaScoreIds.find((obj) => obj[id] !== undefined);
      const value = found ? found[id] : null;
      if (!value) return;

      const logoPath = `${process.env.NEXT_PUBLIC_EXPRESS_SERVER}logo/${value}`;
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

  function getCompetitionPageUrl() {
    return `${getCompetitionUrl(id)}?theme=${getStoredTheme()}`;
  }

  function handleExpandClick() {
    if (!leagueResults) return;
    renderTable(
      fixture.leagueIndex,
      {
        id,
        fixtures: getLeagueFixturesByLeagueId(
          allLeagueResultsArrayOfObjects,
          id
        ),
      },
      id
    );
  }

  return (
    <div>
      <div
        className="leagueName"
        id={`league${id}`}
        key={`leagueName${id}div`}
      >
        <div className="LeagueAndLogo">
          <a
            href={getCompetitionPageUrl()}
            className="leagueName-link"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            {logoUrl && (
              <img
                className="LeagueLogo"
                src={logoUrl}
                alt={`${name} Logo`}
              />
            )}
            {showShortlist ? fixture.leagueDesc : fixture.leagueName}
          </a>
        </div>
        <button
          type="button"
          className="leagueName-expand"
          onClick={handleExpandClick}
          aria-label={`Expand ${name} league table`}
        >
          &#9776;
        </button>
      </div>

      <div
        className="LeagueTable"
        key={`leagueName${id}`}
        id={`leagueName${id}`}
      ></div>
    </div>
  );
}
