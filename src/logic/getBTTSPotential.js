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
  let homeXG = allForm[home].home[index].XG;
  let awayXG = allForm[away].away[index].XG;
  let homeXGAgainst = allForm[home].home[index].XGAgainstAverage;
  let awayXGAgainst = allForm[away].away[index].XGAgainstAverage;
  let homePPG = allForm[home].home[index].PPG
  let awayPPG = allForm[away].away[index].PPG

  let dangerousAttacksHome = allForm[away].home[index].AverageDangerousAttacks;
  let dangerousAttacksAway = allForm[away].away[index].AverageDangerousAttacks;

  match.combinedBTTS = (homeBTTS + awayBTTS) / 2;

if(match.bttsFraction !== "N/A" && match.status !== "suspended" && match.status !== "canceled"){
  if (
    match.combinedBTTS >= 60 &&
    // match.btts_potential >= 60 &&
    awayPPG > 1.5 &&
    // homePPG > 1 &&
    // homeXG >= 1.1 && 
    // awayXG >= 1.1 &&
    // homeXGAgainst > 1.1 &&
    // awayXGAgainst > 1.1 &&
    homeG >= 1 &&
    awayG >= 1
  ) {
    match.btts = true;
    match.bttsChosen = true;
  } else {
    match.btts = false;
    match.bttsChosen = false;
  }
}
  
  }
  return match;
}

