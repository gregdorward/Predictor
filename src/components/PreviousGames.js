function PreviousGames(props) {
  // Function to find the key(s) from a given value
  function getKeysByValue(object, value) {
    // Use Object.keys() and filter to find keys with the given value
    return Object.keys(object).filter((key) => object[key] === value);
  }

  // Capture the array of JSX elements created by map
  const games = props.reducedArr.map((result, index) => {
    // Example usage
    const home = result.team_a_id; // The value you want to find the key for
    const away = result.team_b_id; // The value you want to find the key for

    const teamNameHome = getKeysByValue(props.teamObject, home);
    const teamNameAway = getKeysByValue(props.teamObject, away);
    const unixTimestamp = result.date_unix;
    const milliseconds = unixTimestamp * 1000;
    const dateObject = new Date(milliseconds);
    const date = `${dateObject.getDate()}/${
      dateObject.getMonth() + 1
    }/${dateObject.getFullYear()}`;

    return (
      <>
        <li key="lastGameDetail" className="LastGameDetail">
          {`${date}`}
        </li>
        <div className="LastGameOverview" key={index}>
          <div className="LastGameHome">{`${teamNameHome}`}</div>
          <span className="LastGameScore">{`${result.team_a_goals}`}</span>
          <span className="LastGameScore">{`${result.team_b_goals}`}</span>
          <div className="LastGameAway">{`${teamNameAway}`}</div>{" "}
          {/* Changed team_b_id */}
        </div>
      </>
    );
  });

  // Return the array of JSX elements
  return <>{games}</>;
}

export default PreviousGames;
