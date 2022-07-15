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


  let homeBTTS = allForm[home].home[index].BttsPercentage;
  let awayBTTS = allForm[away].away[index].BttsPercentage;
  let homeOnlyBTTS = allForm[home].home[index].BTTSPercentage;
  let awayOnlyBTTS = allForm[away].away[index].BTTSPercentage;
  let homeG = homeGoals;
  let awayG = awayGoals;


  let homeXG = allForm[home].home[index].XGOverall;
  let awayXG = allForm[away].away[index].XGOverall;


  match.combinedBTTS = (homeBTTS + awayBTTS) / 2;
  match.combinedBTTSHorA = (homeOnlyBTTS + awayOnlyBTTS) / 2;

if(match.bttsFraction !== "N/A" && match.status !== "suspended" && match.status !== "canceled"){
  if (
    match.combinedBTTS > 50 &&
    match.combinedBTTSHorA > 50 &&
    match.awayOdds < 4 &&
    match.awayOdds > 1.4 &&
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

