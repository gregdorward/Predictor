export async function getBTTSPotential(allForm, match, index) {

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
  let homeXG = allForm[home].home[index].expectedGoals;
  let awayXG = allForm[away].away[index].expectedGoals;
  let homePPG = allForm[home].home[index].PPG
  let awayPPG = allForm[away].away[index].PPG

  let dangerousAttacksHome = allForm[away].home[index].DangerousAttacksHome;
  let dangerousAttacksAway = allForm[away].away[index].DangerousAttacksAway;

  match.combinedBTTS = (homeBTTS + awayBTTS) / 2;

if(match.bttsFraction !== "N/A" && match.status !== "suspended" && match.status !== "canceled"){
  if (
    match.combinedBTTS >= 65 &&
    match.btts_potential > 60 &&
    awayPPG > 1.4 &&
    homePPG > 1 &&
    dangerousAttacksHome >= 40 && 
    dangerousAttacksAway >= 40 &&
    homeXG >= 1 && 
    awayXG >= 1
  ) {
    match.btts = true;
    match.bttsChosen = true;
  } else if (
    match.combinedBTTS >= 55 &&
    match.btts_potential > 50 &&
    dangerousAttacksHome > 40 && 
    dangerousAttacksAway > 40 &&
    awayPPG > 1.3 &&
    homePPG > 1 &&
    homeXG >= 0.9 && 
    awayXG >= 0.9
  ){
    match.btts = true;
    match.bttsChosen = false;
  } else {
    match.btts = false;
    match.bttsChosen = false;
  }
}
  
  }
  return match;
}

