import { Fragment, useEffect, useState } from "react";
import { getHighestScoringTeams } from "../logic/getStatsInsights";
import SiteHeader from "./SiteHeader";
import PageMeta from "./PageMeta";
import {
  BodyCell,
  HeadCell,
  SubpageTable,
} from "./SubpageDataTable";

export default function HighestScoringTeams() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    async function fetchTeams() {
      const data = await getHighestScoringTeams();
      console.log(data)
      setTeams(data);
    }
    fetchTeams();
  }, []);

  const allowedCountries = [
    "England",
    "Scotland",
    "Italy",
    "Spain",
    "Germany",
    "France",
    "USA",
    "Denmark",
    "Greece",
    "Turkey",
    "Switzerland",
    "Austria",
    "Norway",
    "Mexico",
    "Poland",
    "Brazil",
    "Argentina",
    "Sweden",
    "Netherlands",
    "Portugal",
    "Belgium",
  ];

  // Filter teams based on allowed countries
  const filteredTeams = teams.filter((team) =>
    allowedCountries.includes(team.teamCountry)
  );

  return (
    <Fragment>
      <PageMeta />
      <SiteHeader withFooter>
      <div className="SubpageContent" id="ssh-content">
      <a href="/" className="HomeLink" style={{ color: "var(--accent-color)", fontWeight: 600 }}>Home</a>
      <h1>Highest Scoring Teams</h1>
      <h2>Teams with the highest average goals and their upcoming fixture</h2>
      <SubpageTable
        className="O25Table"
        aria-label="highest scoring teams"
      >
        <thead>
          <tr>
            <HeadCell className="SubpageCol--country">Country</HeadCell>
            <HeadCell>Team</HeadCell>
            <HeadCell>Next</HeadCell>
            <HeadCell>Avg</HeadCell>
            <HeadCell>O2.5%</HeadCell>
          </tr>
        </thead>
        <tbody>
          {filteredTeams.map((team, index) => (
            <tr key={index}>
              <BodyCell className="SubpageCol--country">
                {team.teamCountry}
              </BodyCell>
              <BodyCell>{team.team}</BodyCell>
              <BodyCell>{team.next_match_team}</BodyCell>
              <BodyCell>{team.averageGoals}</BodyCell>
              <BodyCell>{team.over25Percentage}%</BodyCell>
            </tr>
          ))}
        </tbody>
      </SubpageTable>
      </div>
      </SiteHeader>
    </Fragment>
  );
}
