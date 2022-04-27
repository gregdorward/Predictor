export async function getBTTSPotential(allForm, match, index, homeGoals, awayGoals) {

  let homeTeam = match.homeTeam;
  let awayTeam = match.awayTeam;


  let home = allForm.findIndex(function (item, i) {
    return item.home.teamName === homeTeam;
  });

  let away = allForm.findIndex(function (item, i) {
    return item.away.teamName === awayTeam;
  });
  if(home !== -1 && away !== -1){


  let homeBTTS = allForm[home].home[index].BTTSPercentage;
  let awayBTTS = allForm[away].away[index].BTTSPercentage;
  let homeG = homeGoals;
  let awayG = awayGoals;

  let homeGoalsScoredAverage = allForm[home].home[index].ScoredAverage
  let awayGoalsScoredAverage = allForm[away].away[index].ScoredAverage

  let homeGoalsConceededAverage = allForm[home].home[index].ConcededAverage
  let awayGoalsConceededAverage = allForm[away].away[index].ConcededAverage

  let homeXG = allForm[home].home[index].XGOverall;
  let awayXG = allForm[away].away[index].XGOverall;

  let homeXGAgainst = allForm[home].home[index].XGAgainstAverage;
  let awayXGAgainst = allForm[away].away[index].XGAgainstAverage;

  let homeGoalsAveragedOut = (homeGoalsScoredAverage + homeXG) / 2
  let awayGoalsAveragedOut = (awayGoalsScoredAverage + awayXG) / 2 

  let homeGoalsConceededAveragedOut = (homeGoalsConceededAverage + homeXGAgainst) / 2
  let awayGoalsConceededAveragedOut = (awayGoalsConceededAverage + awayXGAgainst) / 2

  match.combinedBTTS = (homeBTTS + awayBTTS) / 2;

if(match.bttsFraction !== "N/A" && match.status !== "suspended" && match.status !== "canceled"){
  if (
    match.combinedBTTS > 60 &&
    match.awayOdds < 3.5 &&
    match.awayOdds > 1.4 &&
    // homeGoalsAveragedOut > 1 &&
    // awayGoalsAveragedOut > 1 &&
    // homeGoalsConceededAveragedOut > 1 &&
    // awayGoalsConceededAveragedOut > 1 &&
    homeXG >= 1.1 &&
    awayXG >= 1.1 &&
    homeG >= 1 &&
    awayG >= 1
  ) {
    match.btts = true;
    match.bttsChosen = true;
    match.totalGoals = match.rawFinalHomeGoals + match.rawFinalAwayGoals
  } else {
    match.btts = false;
    match.bttsChosen = false;
  }
}
  
  }
  return match;
}

