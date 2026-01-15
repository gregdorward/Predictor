export async function getBTTSPotential(
  match,
  homeGoals,
  awayGoals,
  directnessHome,
  directnessAway
) {
  const homeBTTS = match.bttsAllPercentageHome;
  const homeOnlyBTTS = match.bttsPercentageHomeHome;
  const awayOnlyBTTS = match.bttsPercentageAwayAway;
  const awayBTTS = match.bttsAllPercentageAway;
  const homeG = homeGoals;
  const awayG = awayGoals;

  console.log(match)
  match.combinedBTTS = (homeBTTS + awayBTTS) / 2;

  if (
    match.bttsFraction !== "N/A" &&
    match.status !== "suspended" &&
    match.status !== "canceled"
  ) {
    if (
      match.bttsYesProbability >= 60 &&
      homeG >= 1 &&
      awayG >= 1
    ) {
      match.btts = true;
      match.bttsChosen = true;
      match.totalGoals = match.rawFinalHomeGoals + match.rawFinalAwayGoals;
    } else {
      match.btts = false;
      match.bttsChosen = false;
    }
  }
  return match;
}
