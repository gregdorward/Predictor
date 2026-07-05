export function buildShotStackSeries(games = [], teamName = "") {
  const sorted = [...games].sort((a, b) => a.unixTimestamp - b.unixTimestamp);

  return sorted.map((game, index) => {
    const isHome = game.homeTeam === teamName;
    const goals =
      Number(isHome ? game.homeGoals : game.awayGoals) ||
      Number(game.goalsFor) ||
      0;
    const sot = Number(isHome ? game.homeSot : game.awaySot) || 0;
    const shots = Number(isHome ? game.homeShots : game.awayShots) || 0;

    const label = game.date
      ? String(game.date).split(",")[0].trim()
      : `G${index + 1}`;

    return {
      label,
      goals,
      sot,
      shots,
      stackGoals: goals,
      stackSot: Math.max(sot - goals, 0),
      stackShotsOffTarget: Math.max(shots - sot, 0),
    };
  });
}
