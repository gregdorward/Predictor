/**
 * Pick upcoming fixtures for display. Skip the first event only when the schedule
 * is long enough that index 0 is likely the current match.
 */
export function selectUpcomingFixtures(events, maxCount = 5) {
  const items = Array.isArray(events) ? events : [];

  if (items.length > maxCount) {
    return items.slice(1, maxCount + 1);
  }

  return items.slice(0, maxCount);
}

export function mapFutureFixtureEvents(events) {
  return (events || []).map((event) => ({
    tournamentName: event.tournament?.name || "",
    homeTeam: event.homeTeam?.name || "",
    awayTeam: event.awayTeam?.name || "",
    date: event.startTimestamp
      ? new Date(event.startTimestamp * 1000).toLocaleDateString("en-GB")
      : "N/A",
    colourOne: event.tournament?.uniqueTournament?.primaryColorHex || "",
    colourTwo: event.tournament?.uniqueTournament?.secondaryColorHex || "",
  }));
}
