export function sortTeamsByLastFive(teams) {
  return [...teams].sort((a, b) => {
    const formPts = (b.LastXPoints ?? 0) - (a.LastXPoints ?? 0);
    if (formPts !== 0) {
      return formPts;
    }
    return (b.GoalDifference ?? 0) - (a.GoalDifference ?? 0);
  });
}
