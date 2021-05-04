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
  let awayPPG = allForm[away].away[index].PPG

  console.log(homeBTTS)

  let dangerousAttacksHome = allForm[away].home[index].DangerousAttacksHome;
  let dangerousAttacksAway = allForm[away].away[index].DangerousAttacksAway;

  match.combinedBTTS = (homeBTTS + awayBTTS) / 2;

if(match.bttsFraction !== "N/A" && match.status !== "suspended" && match.status !== "canceled"){
  if (
    match.combinedBTTS >= 60 &&
    match.btts_potential > 50 &&
    awayPPG > 1.4 &&
    dangerousAttacksHome >= 50 && 
    dangerousAttacksAway >= 50
  ) {
    match.btts = true;
    match.bttsChosen = true;
  } else if (
    match.combinedBTTS >= 55 &&
    match.btts_potential > 50 &&
    dangerousAttacksHome > 45 && 
    dangerousAttacksAway > 45 &&
    awayPPG > 1.2
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

