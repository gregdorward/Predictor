export async function getBTTSPotential(
  match,
  homeGoals,
  awayGoals,
  unroundedHomeGoals,
  unroundedAwayGoals
) {
  const homeBTTS = match.bttsAllPercentageHome;
  const homeOnlyBTTS = match.bttsPercentageHomeHome;
  const awayOnlyBTTS = match.bttsPercentageAwayAway;
  const awayBTTS = match.bttsAllPercentageAway;
  const homeG = homeGoals;
  const awayG = awayGoals;

  match.combinedBTTS = (homeBTTS + awayBTTS) / 2;

  if (
    match.bttsFraction !== "N/A" &&
    match.status !== "suspended" &&
    match.status !== "canceled"
  ) {
    if (
      match.combinedBTTS > 60 &&
      homeBTTS > 45 &&
      awayBTTS > 45 &&
      homeOnlyBTTS > 40 &&
      awayOnlyBTTS > 40 &&
      match.awayOdds < 4 &&
      match.awayOdds > 1.3 &&
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
