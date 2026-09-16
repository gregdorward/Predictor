/**
 * Blend model 1X2 probabilities with de-vigged bookie implied odds.
 * Does not touch λ — only the outcome probability vector used for Brier/tips.
 */

function finiteNonNeg(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Decimal odds → raw implied % (not de-vigged). */
export function rawImpliedPct(decimalOdds) {
  const odds = Number(decimalOdds);
  if (!Number.isFinite(odds) || odds <= 1) return null;
  return (1 / odds) * 100;
}

/**
 * Renormalise three non-negative masses to sum to 100.
 * @returns {[number, number, number]|null}
 */
export function normalizeThreeWayPct(home, draw, away) {
  const h = finiteNonNeg(home);
  const d = finiteNonNeg(draw);
  const a = finiteNonNeg(away);
  if (h == null || d == null || a == null) return null;
  const sum = h + d + a;
  if (!(sum > 0)) return null;
  return [(h / sum) * 100, (d / sum) * 100, (a / sum) * 100];
}

/**
 * De-vig 1X2 decimal odds to fair % that sum to 100.
 * @returns {{ home: number, draw: number, away: number }|null}
 */
export function devigThreeWayFromOdds(homeOdds, drawOdds, awayOdds) {
  const fair = normalizeThreeWayPct(
    rawImpliedPct(homeOdds),
    rawImpliedPct(drawOdds),
    rawImpliedPct(awayOdds)
  );
  if (!fair) return null;
  return { home: fair[0], draw: fair[1], away: fair[2] };
}

/**
 * @param {number} modelHome model %
 * @param {number} modelDraw
 * @param {number} modelAway
 * @param {number} homeOdds decimal
 * @param {number} drawOdds
 * @param {number} awayOdds
 * @param {number} marketWeight 0 = pure model, 1 = pure market
 * @returns {{ home: number, draw: number, away: number, blended: boolean }}
 */
export function blendModelWithMarket1x2(
  modelHome,
  modelDraw,
  modelAway,
  homeOdds,
  drawOdds,
  awayOdds,
  marketWeight
) {
  const model = normalizeThreeWayPct(modelHome, modelDraw, modelAway);
  if (!model) {
    return { home: modelHome, draw: modelDraw, away: modelAway, blended: false };
  }

  const w = Number(marketWeight);
  if (!Number.isFinite(w) || w <= 0) {
    return { home: model[0], draw: model[1], away: model[2], blended: false };
  }
  const clamped = Math.min(1, Math.max(0, w));

  const market = normalizeThreeWayPct(
    rawImpliedPct(homeOdds),
    rawImpliedPct(drawOdds),
    rawImpliedPct(awayOdds)
  );
  if (!market) {
    return { home: model[0], draw: model[1], away: model[2], blended: false };
  }

  const blended = normalizeThreeWayPct(
    (1 - clamped) * model[0] + clamped * market[0],
    (1 - clamped) * model[1] + clamped * market[1],
    (1 - clamped) * model[2] + clamped * market[2]
  );
  if (!blended) {
    return { home: model[0], draw: model[1], away: model[2], blended: false };
  }

  return {
    home: blended[0],
    draw: blended[1],
    away: blended[2],
    blended: true,
  };
}
