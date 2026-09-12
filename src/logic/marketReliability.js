/**
 * Favourite / underdog / draw reliability from completed fixtures with 1X2 odds.
 *
 * Mirrors the counting already embedded in getPastLeagueResults, but as pure
 * helpers so a Market Reliability Index can be built from the cached /results
 * blob without running the full prediction pipeline.
 *
 * Favourite = the shorter-priced side of odds_ft_1 vs odds_ft_2. Equal odds are
 * skipped (same as the live form path). Draws are a separate role outcome, not
 * treated as a "favourite".
 */

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Net P&L for a unit stake. A winner returns stake * odds (stake included);
 * net change is odds - 1. Losers / draws lose the stake (-1).
 */
export function unitStakePnl(odds, won) {
  const price = toNumber(odds);
  if (price === null) return null;
  return won ? round2(price - 1) : -1;
}

/** ROI % from cumulative net profit over unit bets. */
export function roiFromProfit(profit, bets) {
  const stakeCount = toNumber(bets);
  if (stakeCount === null || stakeCount <= 0) return null;
  const net = toNumber(profit);
  if (net === null) return null;
  return round1((net / stakeCount) * 100);
}

export function emptyRoleCounts() {
  return {
    favouriteCount: 0,
    winningFavouriteCount: 0,
    drawingFavouriteCount: 0,
    beatenFavouriteCount: 0,
    underdogCount: 0,
    winningUnderdogCount: 0,
    drawingUnderdogCount: 0,
    beatenUnderdogCount: 0,
    favouriteProfit: 0,
    underdogProfit: 0,
    underdogPoints: 0,
  };
}

/**
 * Classify one completed fixture from the home team's perspective.
 * Returns null when odds are missing or equal.
 */
export function classifyFixtureRoles(fixture) {
  const homeOdds = toNumber(fixture?.odds_ft_1 ?? fixture?.odds);
  const awayOdds = toNumber(fixture?.odds_ft_2 ?? fixture?.oppositionOdds);
  const homeGoals = toNumber(fixture?.homeGoalCount ?? fixture?.homeGoals);
  const awayGoals = toNumber(fixture?.awayGoalCount ?? fixture?.awayGoals);
  const drawOdds = toNumber(fixture?.odds_ft_x);

  if (
    homeOdds === null ||
    awayOdds === null ||
    homeGoals === null ||
    awayGoals === null ||
    homeOdds === awayOdds
  ) {
    return null;
  }

  const homeWon = homeGoals > awayGoals;
  const awayWon = awayGoals > homeGoals;
  const drawn = homeGoals === awayGoals;
  const homeIsFavourite = homeOdds < awayOdds;

  return {
    homeOdds,
    awayOdds,
    drawOdds,
    homeIsFavourite,
    awayIsFavourite: !homeIsFavourite,
    homeWon,
    awayWon,
    drawn,
    favouriteWon: homeIsFavourite ? homeWon : awayWon,
    favouriteDrew: drawn,
    favouriteLost: homeIsFavourite ? awayWon : homeWon,
  };
}

/** Apply one fixture to a team's running role counts (home or away view). */
export function addTeamRoleResult(
  counts,
  { isFavourite, won, drew, lost, odds }
) {
  const next = { ...counts };
  const pnl = unitStakePnl(odds, won);
  if (isFavourite) {
    next.favouriteCount += 1;
    if (won) next.winningFavouriteCount += 1;
    if (drew) next.drawingFavouriteCount += 1;
    if (lost) next.beatenFavouriteCount += 1;
    if (pnl !== null) next.favouriteProfit = round2(next.favouriteProfit + pnl);
  } else {
    next.underdogCount += 1;
    if (won) next.winningUnderdogCount += 1;
    if (drew) next.drawingUnderdogCount += 1;
    if (lost) next.beatenUnderdogCount += 1;
    if (pnl !== null) next.underdogProfit = round2(next.underdogProfit + pnl);
    if (won) next.underdogPoints += 3;
    else if (drew) next.underdogPoints += 1;
  }
  return next;
}

export function summariseRoleCounts(counts) {
  const favouriteCount = counts.favouriteCount || 0;
  const underdogCount = counts.underdogCount || 0;

  const oddsReliabilityWin =
    favouriteCount > 0
      ? round1((counts.winningFavouriteCount / favouriteCount) * 100)
      : null;
  const oddsReliabilityDraw =
    favouriteCount > 0
      ? round1((counts.drawingFavouriteCount / favouriteCount) * 100)
      : null;
  const oddsReliabilityLose =
    favouriteCount > 0
      ? round1((counts.beatenFavouriteCount / favouriteCount) * 100)
      : null;
  const oddsReliabilityWinAsUnderdog =
    underdogCount > 0
      ? round1((counts.winningUnderdogCount / underdogCount) * 100)
      : null;
  const oddsReliabilityDrawAsUnderdog =
    underdogCount > 0
      ? round1((counts.drawingUnderdogCount / underdogCount) * 100)
      : null;
  const oddsReliabilityLoseAsUnderdog =
    underdogCount > 0
      ? round1((counts.beatenUnderdogCount / underdogCount) * 100)
      : null;

  const reliableIndicator =
    (counts.winningFavouriteCount || 0) + (counts.beatenUnderdogCount || 0);
  const unreliableIndicator =
    (counts.beatenFavouriteCount || 0) +
    (counts.drawingFavouriteCount || 0) +
    (counts.winningUnderdogCount || 0) +
    (counts.drawingUnderdogCount || 0);

  const favouriteProfit = round2(counts.favouriteProfit || 0);
  const underdogProfit = round2(counts.underdogProfit || 0);

  return {
    ...counts,
    favouriteProfit,
    underdogProfit,
    underdogPoints: counts.underdogPoints || 0,
    favouriteRoi: roiFromProfit(favouriteProfit, favouriteCount),
    underdogRoi: roiFromProfit(underdogProfit, underdogCount),
    oddsReliabilityWin,
    oddsReliabilityDraw,
    oddsReliabilityLose,
    oddsReliabilityWinAsUnderdog,
    oddsReliabilityDrawAsUnderdog,
    oddsReliabilityLoseAsUnderdog,
    reliableIndicator,
    unreliableIndicator,
    reliabilityLabel: reliabilityLabelForFavouriteWinRate(oddsReliabilityWin),
  };
}

/** Reliability band from favourite win rate (0–100). */
export function reliabilityLabelForFavouriteWinRate(percent) {
  if (
    percent === null ||
    percent === undefined ||
    !Number.isFinite(Number(percent))
  ) {
    return "Unknown";
  }
  const n = Number(percent);
  if (n < 23) return "Extremely unreliable";
  if (n < 45) return "Unreliable";
  if (n < 55) return "Mixed";
  if (n < 63) return "Fairly reliable";
  if (n < 69) return "Reliable";
  return "Excellent";
}

/** CSS tone key for traffic-light reliability dots (deeper at extremes). */
export function reliabilityToneForFavouriteWinRate(percent) {
  if (
    percent === null ||
    percent === undefined ||
    !Number.isFinite(Number(percent))
  ) {
    return "unknown";
  }
  const n = Number(percent);
  if (n < 23) return "extremely-unreliable";
  if (n < 45) return "unreliable";
  if (n < 55) return "mixed";
  if (n < 63) return "fairly-reliable";
  if (n < 69) return "reliable";
  return "excellent";
}

/**
 * League-level summary from completed fixtures in one results league object.
 * Counts each priced match once (favourite side), not twice per team.
 */
export function buildLeagueReliabilityFromFixtures(fixtures) {
  const list = Array.isArray(fixtures) ? fixtures : [];
  let priced = 0;
  let favouriteWins = 0;
  let favouriteDraws = 0;
  let favouriteLosses = 0;
  let draws = 0;
  let homeFavouriteWins = 0;
  let awayFavouriteWins = 0;
  let homeFavourites = 0;
  let awayFavourites = 0;
  let favouriteProfit = 0;

  for (const fixture of list) {
    if (fixture?.status && fixture.status !== "complete") continue;
    const roles = classifyFixtureRoles(fixture);
    if (!roles) continue;

    priced += 1;
    if (roles.drawn) draws += 1;
    if (roles.favouriteWon) favouriteWins += 1;
    if (roles.favouriteDrew) favouriteDraws += 1;
    if (roles.favouriteLost) favouriteLosses += 1;

    const favouriteOdds = roles.homeIsFavourite
      ? roles.homeOdds
      : roles.awayOdds;
    const favPnl = unitStakePnl(favouriteOdds, roles.favouriteWon);
    if (favPnl !== null) favouriteProfit = round2(favouriteProfit + favPnl);

    if (roles.homeIsFavourite) {
      homeFavourites += 1;
      if (roles.homeWon) homeFavouriteWins += 1;
    } else {
      awayFavourites += 1;
      if (roles.awayWon) awayFavouriteWins += 1;
    }
  }

  const favouriteHitRate =
    priced > 0 ? round1((favouriteWins / priced) * 100) : null;

  return {
    pricedMatches: priced,
    played: list.filter(
      (f) => !f?.status || f.status === "complete"
    ).length,
    favouriteHitRate,
    favouriteDrawRate:
      priced > 0 ? round1((favouriteDraws / priced) * 100) : null,
    favouriteUpsetRate:
      priced > 0 ? round1((favouriteLosses / priced) * 100) : null,
    drawRate: priced > 0 ? round1((draws / priced) * 100) : null,
    homeFavouriteHitRate:
      homeFavourites > 0
        ? round1((homeFavouriteWins / homeFavourites) * 100)
        : null,
    awayFavouriteHitRate:
      awayFavourites > 0
        ? round1((awayFavouriteWins / awayFavourites) * 100)
        : null,
    favouriteWins,
    favouriteDraws,
    favouriteLosses,
    homeFavourites,
    awayFavourites,
    favouriteProfit: round2(favouriteProfit),
    favouriteRoi: roiFromProfit(favouriteProfit, priced),
    reliabilityLabel: reliabilityLabelForFavouriteWinRate(favouriteHitRate),
  };
}

/**
 * Per-team role records inside one league's fixture list.
 */
export function buildTeamReliabilityFromFixtures(fixtures) {
  const byTeam = new Map();

  const ensure = (name) => {
    if (!byTeam.has(name)) {
      byTeam.set(name, emptyRoleCounts());
    }
    return byTeam.get(name);
  };

  for (const fixture of fixtures || []) {
    if (fixture?.status && fixture.status !== "complete") continue;
    const roles = classifyFixtureRoles(fixture);
    if (!roles) continue;

    const homeName = fixture.home_name || fixture.homeName;
    const awayName = fixture.away_name || fixture.awayName;
    if (!homeName || !awayName) continue;

    byTeam.set(
      homeName,
      addTeamRoleResult(ensure(homeName), {
        isFavourite: roles.homeIsFavourite,
        won: roles.homeWon,
        drew: roles.drawn,
        lost: roles.awayWon,
        odds: roles.homeOdds,
      })
    );
    byTeam.set(
      awayName,
      addTeamRoleResult(ensure(awayName), {
        isFavourite: roles.awayIsFavourite,
        won: roles.awayWon,
        drew: roles.drawn,
        lost: roles.homeWon,
        odds: roles.awayOdds,
      })
    );
  }

  return [...byTeam.entries()].map(([name, counts]) => ({
    name,
    ...summariseRoleCounts(counts),
  }));
}
