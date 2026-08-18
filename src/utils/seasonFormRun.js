/**
 * Prefer current-season league WDL over FootyStats formRun_* strings.
 * formRun often includes previous-season results when a team has played < 5
 * league games this season (e.g. National League North/South early weeks).
 */

function asWdlChars(value) {
  return Array.from(String(value || "").toUpperCase()).filter(
    (result) => result === "W" || result === "D" || result === "L"
  );
}

/**
 * Keep only the newest `seasonPlayed` results from an oldest→newest form run.
 * When seasonPlayed is 0 / missing, return [] rather than previous-season noise.
 */
export function limitFormRunToSeasonPlayed(formRun, seasonPlayed) {
  const chars = asWdlChars(formRun);
  const played = Number(seasonPlayed);
  if (!Number.isFinite(played) || played <= 0) {
    return [];
  }
  return chars.slice(-Math.floor(played));
}

/**
 * Build last-N form arrays for a side with fewer than 5 league games.
 * Uses table WDL when present; otherwise trims FootyStats formRun to seasonPlayed.
 * Never pads with untrimmed cross-season formRun.
 */
export function buildThinLeagueFormSlices(
  wdlHome,
  wdlAway,
  {
    homeFormRunOverall,
    awayFormRunOverall,
    homeSeasonPlayed,
    awaySeasonPlayed,
  } = {}
) {
  let home = asWdlChars(wdlHome);
  let away = asWdlChars(wdlAway);

  // FootyStats often omits wdl_record early in lower leagues; fall back to a
  // season-capped formRun so we never show last season's five results.
  if (!home.length && homeSeasonPlayed) {
    home = limitFormRunToSeasonPlayed(homeFormRunOverall, homeSeasonPlayed);
  }
  if (!away.length && awaySeasonPlayed) {
    away = limitFormRunToSeasonPlayed(awayFormRunOverall, awaySeasonPlayed);
  }

  return {
    lastThreeFormHome: home.slice(-3),
    lastFiveFormHome: home.slice(-5),
    lastSixFormHome: home.slice(-6),
    lastTenFormHome: home.slice(-10),
    lastThreeFormAway: away.slice(-3),
    lastFiveFormAway: away.slice(-5),
    lastSixFormAway: away.slice(-6),
    lastTenFormAway: away.slice(-10),
    leagueOrAll: "League",
    hasLeagueForm: home.length > 0 || away.length > 0,
  };
}

/** Cap a newest-first W/D/L list to this season's games played. */
export function capFormResultsToSeasonPlayed(results, seasonPlayed, max = 5) {
  const list = Array.isArray(results)
    ? results.filter((result) => result === "W" || result === "D" || result === "L")
    : asWdlChars(results);
  const played = Number(seasonPlayed);
  const limit =
    Number.isFinite(played) && played >= 0
      ? Math.min(max, Math.floor(played))
      : max;
  return list.slice(0, limit);
}

/**
 * Resolve how many current-season games to show on form pills.
 * Prefer league-table played / WDL length over FootyStats PlayedHome+Away
 * (those can count cups or otherwise exceed league Pld). When the fixture
 * is still under 5 league games, never exceed matches_completed_minimum —
 * otherwise inflated Played* lets previous-season formRun show 5 pills.
 *
 * Home/Away must never exceed the overall ("All") season cap — FootyStats
 * venue formRun often still carries previous-season games.
 */
export function resolveDisplaySeasonPlayed(
  form,
  {
    kind = "all",
    matchesCompletedMinimum,
    currentSeasonOnly = false,
  } = {}
) {
  const mcm = Number(matchesCompletedMinimum);
  const wdlLen = asWdlChars(
    Array.isArray(form?.WDLRecord) ? form.WDLRecord.join("") : form?.WDLRecord
  ).length;
  const leaguePlayed = Number(form?.leaguePlayed);
  const overallPlayed = Number(form?.seasonMatchesPlayedOverall);
  const homeAway =
    (Number(form?.PlayedHome) || 0) + (Number(form?.PlayedAway) || 0);

  const overallCandidates = [leaguePlayed, wdlLen, overallPlayed, homeAway].filter(
    (n) => Number.isFinite(n) && n > 0
  );
  let overallCap = overallCandidates.length
    ? Math.min(...overallCandidates)
    : NaN;

  if (!Number.isFinite(overallCap) || overallCap < 0) {
    overallCap = Number.isFinite(mcm) && mcm > 0 ? mcm : NaN;
  }

  if (
    currentSeasonOnly &&
    Number.isFinite(mcm) &&
    mcm > 0 &&
    Number.isFinite(overallCap)
  ) {
    overallCap = Math.min(overallCap, mcm);
  } else if (
    currentSeasonOnly &&
    Number.isFinite(mcm) &&
    mcm > 0 &&
    !Number.isFinite(overallCap)
  ) {
    overallCap = mcm;
  }

  if (kind === "all") {
    return Number.isFinite(overallCap) ? overallCap : null;
  }

  let venuePlayed =
    kind === "home" ? Number(form?.PlayedHome) : Number(form?.PlayedAway);

  if (!Number.isFinite(venuePlayed) || venuePlayed < 0) {
    venuePlayed = Number.isFinite(overallCap) ? overallCap : null;
  } else if (Number.isFinite(overallCap)) {
    // Never show more venue pills than overall season games.
    venuePlayed = Math.min(venuePlayed, overallCap);
  }

  if (
    currentSeasonOnly &&
    Number.isFinite(mcm) &&
    mcm > 0 &&
    Number.isFinite(venuePlayed)
  ) {
    venuePlayed = Math.min(venuePlayed, mcm);
  }

  return Number.isFinite(venuePlayed) ? venuePlayed : null;
}

/** Cap LastFive/Six/Ten (and results*) on a stored form side when under 5 games. */
export function sanitizeThinSeasonFormSide(form) {
  if (!form || typeof form !== "object") {
    return form;
  }
  const played = resolveDisplaySeasonPlayed(form, {
    kind: "all",
    currentSeasonOnly: true,
  });
  if (!Number.isFinite(played) || played >= 5) {
    return form;
  }
  const cap = (value) => capFormResultsToSeasonPlayed(value, played, 10);
  if (Array.isArray(form.LastFiveForm) || typeof form.LastFiveForm === "string") {
    form.LastFiveForm = cap(form.LastFiveForm).slice(0, 5);
  }
  if (Array.isArray(form.LastSixForm) || typeof form.LastSixForm === "string") {
    form.LastSixForm = cap(form.LastSixForm).slice(0, 6);
  }
  if (Array.isArray(form.LastTenForm) || typeof form.LastTenForm === "string") {
    form.LastTenForm = cap(form.LastTenForm).slice(0, 10);
  }
  if (Array.isArray(form.lastThreeForm) || typeof form.lastThreeForm === "string") {
    form.lastThreeForm = cap(form.lastThreeForm).slice(0, 3);
  }
  if (Array.isArray(form.resultsAll)) {
    form.resultsAll = cap(form.resultsAll).slice(0, 6);
  }
  if (Array.isArray(form.resultsHome)) {
    form.resultsHome = capFormResultsToSeasonPlayed(
      form.resultsHome,
      Math.min(Number(form.PlayedHome) || played, played),
      6
    );
  }
  if (Array.isArray(form.resultsAway)) {
    form.resultsAway = capFormResultsToSeasonPlayed(
      form.resultsAway,
      Math.min(Number(form.PlayedAway) || played, played),
      6
    );
  }
  return form;
}
