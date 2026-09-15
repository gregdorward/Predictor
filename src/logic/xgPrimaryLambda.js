/**
 * xG-primary expected-goals engine.
 *
 * Intensity comes from non-penalty xG (fallback xG / goals): blend of the
 * team's attack xG and the opponent's xG against. Finishing (goals vs xG)
 * only applies a small pull — hot streaks do not get a big boost.
 */

import { npxgOrXg } from "./nonPenaltyXg.js";

const ATTACK_WEIGHT = 0.55;
const DEFENCE_WEIGHT = 0.45;
const FULL_SAMPLE = 8;
/** Max |finishing| adjustment to λ (goals/xG − 1). */
const FINISHING_CAP = 0.12;
const FINISHING_WEIGHT = 0.25;

function finitePositive(value, fallback) {
  const n = Number(value);
  if (Number.isFinite(n) && n > 0) return n;
  return fallback;
}

function formAttackXg(form) {
  return finitePositive(
    npxgOrXg(form?.npXGOverall, form?.XGOverall ?? form?.ScoredAverage),
    null
  );
}

function formDefenceXg(form) {
  return finitePositive(
    npxgOrXg(
      form?.npXGAgainstAvgOverall,
      form?.XGAgainstAvgOverall ?? form?.avgConceeded ?? form?.ConcededAverage
    ),
    null
  );
}

function formGoalsFor(form) {
  return finitePositive(
    form?.teamGoalsRollingAverage ?? form?.ScoredAverage ?? form?.avgScored,
    null
  );
}

/**
 * Mild finishing factor: overperformers get a small lift, underperformers a
 * small cut. Cap keeps this from dominating xG.
 */
function finishingFactor(form) {
  const xg = formAttackXg(form);
  const goals = formGoalsFor(form);
  if (xg == null || goals == null || xg <= 0) return 1;
  const residual = (goals - xg) / xg;
  const capped = Math.max(-FINISHING_CAP, Math.min(FINISHING_CAP, residual));
  return 1 + FINISHING_WEIGHT * capped;
}

function shrinkToMu(raw, mu, games) {
  const r = finitePositive(raw, mu);
  const m = finitePositive(mu, r);
  const n = Number(games);
  const w =
    Number.isFinite(n) && n > 0 ? Math.min(1, Math.max(0, n / FULL_SAMPLE)) : 0.5;
  return m * (1 - w) + r * w;
}

/**
 * @returns {{ home: number, away: number }}
 */
export function xgPrimaryLambdas({
  homeForm,
  awayForm,
  averageGoalsHome,
  averageGoalsAway,
  averageGoalsPerTeam = 1.25,
}) {
  const muHome = finitePositive(averageGoalsHome, averageGoalsPerTeam);
  const muAway = finitePositive(averageGoalsAway, averageGoalsPerTeam);
  const mu = finitePositive(averageGoalsPerTeam, (muHome + muAway) / 2);

  const homeAtt = formAttackXg(homeForm) ?? mu;
  const awayDef = formDefenceXg(awayForm) ?? mu;
  const awayAtt = formAttackXg(awayForm) ?? mu;
  const homeDef = formDefenceXg(homeForm) ?? mu;

  const homeRaw = ATTACK_WEIGHT * homeAtt + DEFENCE_WEIGHT * awayDef;
  const awayRaw = ATTACK_WEIGHT * awayAtt + DEFENCE_WEIGHT * homeDef;

  const homeGames = Number(homeForm?.gamesPlayed) || 0;
  const awayGames = Number(awayForm?.gamesPlayed) || 0;

  let home = shrinkToMu(homeRaw, muHome, homeGames);
  let away = shrinkToMu(awayRaw, muAway, awayGames);

  home *= finishingFactor(homeForm);
  away *= finishingFactor(awayForm);

  return {
    home: Math.max(0.05, home),
    away: Math.max(0.05, away),
  };
}
