import React from 'react';
import { useSelector } from 'react-redux';
import { CreateBadge } from '../components/createBadge';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);



const TeamPage = () => {

  const storedDataHome = useSelector((state) => state.data.dataHome);
  const jsonDataHome = JSON.parse(storedDataHome)
  const propertyNamesHome = Object.entries(jsonDataHome);

  const storedDataHomeDef = useSelector((state) => state.data.dataHomeDef);
  const jsonDataHomeDef = JSON.parse(storedDataHomeDef)
  const propertyNamesHomeDef = Object.entries(jsonDataHomeDef);

  const storedDataallTeamResultsHome = useSelector((state) => state.data.allTeamResultsHome);
  const jsonDataallTeamResultsHome = JSON.parse(storedDataallTeamResultsHome)
  const propertyNamesallTeamResultsHome = Object.values(jsonDataallTeamResultsHome);

  const homeDetails = useSelector((state) => state.data.homeDetails);
  const jsonHomeDetails = JSON.parse(homeDetails)

  const storedDataAway = useSelector((state) => state.data.dataAway);
  const jsonDataAway = JSON.parse(storedDataAway)
  const propertyNamesAway = Object.entries(jsonDataAway);

  const storedDataAwayDef = useSelector((state) => state.data.dataAwayDef);
  const jsonDataAwayDef = JSON.parse(storedDataAwayDef)
  const propertyNamesAwayDef = Object.entries(jsonDataAwayDef);

  const storedDataallTeamResultsAway = useSelector((state) => state.data.allTeamResultsAway);
  const jsonDataallTeamResultsAway = JSON.parse(storedDataallTeamResultsAway)
  const propertyNamesallTeamResultsAway = Object.values(jsonDataallTeamResultsAway);

  const awayDetails = useSelector((state) => state.data.awayDetails);
  const jsonAwayDetails = JSON.parse(awayDetails)

  const storedFixtureDetails = useSelector((state) => state.data.fixtureDetails)
  const storedFixtureDetailsJson = JSON.parse(storedFixtureDetails)

  const options = {
    plugins: {
      title: {
        display: true,
        text: 'Team comparison',
      },
    },
    aspectRatio: 0.5,
    maintainAspectRatio: true,
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        display: false
      },
    },
  };
  const labels = [storedFixtureDetailsJson.homeTeamName, storedFixtureDetailsJson.awayTeamName];

  const data = {
    labels,
    datasets: [
    {
      data: [jsonHomeDetails["Attacking Strength"], [jsonAwayDetails["Attacking Strength"]]],
      label: "Attacking Strength",
      backgroundColor: "#030061",

    }, 
    {
      data: [jsonHomeDetails["Defensive Strength"], [jsonAwayDetails["Defensive Strength"]]],
      label: "Defensive Strength",
      backgroundColor: "#CC3314",
    }, 
  ]
  };
  




  return (
      <div className="TeamStatsContainer">
      <div className='FixtureHeadingContiner'>
          <CreateBadge image={storedFixtureDetailsJson.homeTeamBadge}
            ClassName="HomeTeamBadge"
            alt="Home team badge">
          </CreateBadge>
            {`${storedFixtureDetailsJson.homeTeamName} v ${storedFixtureDetailsJson.awayTeamName}`}
            <CreateBadge image={storedFixtureDetailsJson.awayTeamBadge}
            ClassName="AwayTeamBadge"
            alt="Away team badge">
          </CreateBadge>
      </div>
      <h4>{storedFixtureDetailsJson.stadium} KO: {storedFixtureDetailsJson.time}</h4>
      <h4>XGTipping Prediction: {storedFixtureDetailsJson.homeGoals} - {storedFixtureDetailsJson.awayGoals}</h4>
      <div className="TeamStats">
      <ul className='HomeTeamStats'>
      <h4>{storedFixtureDetailsJson.homeTeamName}</h4>
        {propertyNamesHome.map(([key, value], index) => (
          <li key={index}>
            <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
          </li>
        ))}
      </ul>
      <ul className='AwayTeamStats'>
      <h4>{storedFixtureDetailsJson.awayTeamName}</h4>
        {propertyNamesAway.map(([key, value], index) => (
          <li key={index}>
            <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
          </li>
        ))}
      </ul>
      <ul className='HomeTeamStats'>
        {propertyNamesHomeDef.map(([key, value], index) => (
          <li key={index}>
            <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
          </li>
        ))}
      </ul>
      <ul className='AwayTeamStats'>
        {propertyNamesAwayDef.map(([key, value], index) => (
          <li key={index}>
            <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
          </li>
        ))}
      </ul>
      <div className='ChartContainer'>
      <span className='Spacer'></span>
      <Bar options={options} data={data} className='ComparisonBar'/>
      <span className='Spacer'></span>
      </div>
      <ul className='HomeTeamResults'>
      {propertyNamesallTeamResultsHome.map((match, index) => (
        <><div className='MatchDate'>{match.date}</div><div className="ResultRowOverviewSmall">
          <div className="columnOverviewHomeSmall">{match.homeTeam}</div>
          <span className="columnOverviewScoreSmall">
            {match.homeGoals} : {match.awayGoals}
          </span>
          <div className="columnOverviewAwaySmall">{match.awayTeam}</div>
        </div></>
        ))}
      </ul>
      <ul className='AwayTeamResults'>
      {propertyNamesallTeamResultsAway.map((match, index) => (
        <><div className='MatchDate'>{match.date}</div><div className="ResultRowOverviewSmall">
          <div className="columnOverviewHomeSmall">{match.homeTeam}</div>
          <span className="columnOverviewScoreSmall">
            {match.homeGoals} : {match.awayGoals}
          </span>
          <div className="columnOverviewAwaySmall">{match.awayTeam}</div>
        </div></>
        ))}
      </ul>
      </div>
      </div>
  );
};



export default TeamPage;