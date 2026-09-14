import {
  buildScoreMatrix,
  buildNegativeBinomialScoreMatrix,
  buildBivariatePoissonScoreMatrix,
  buildZeroInflatedPoissonScoreMatrix,
  buildScoreMatrixForFamily,
  buildCalibratedScoreMatrixForFamily,
  normaliseScoreMatrix,
  calibrateScoreMatrix,
  poissonProbability,
  negativeBinomialProbability,
  zipProbability,
} from "./scoreMatrix.js";
import {
  applyScoreModelFromEnv,
  getDixonColesRho,
  getScoreMatrixAlpha,
  getScoreMatrixMaxGoals,
  getScoreModelFamily,
  resetScoreMatrixConfig,
  DIXON_COLES_RHO,
  SCORE_MATRIX_ALPHA,
  SCORE_MATRIX_MAX_GOALS,
  SCORE_MODEL_FAMILY,
} from "./scoreModelConfig.js";

function matrixSum(matrix) {
  return matrix.reduce((sum, cell) => sum + cell.probability, 0);
}

function cellProb(matrix, home, away) {
  return matrix.find((c) => c.home === home && c.away === away)?.probability ?? 0;
}

describe("score matrix families", () => {
  afterEach(() => {
    resetScoreMatrixConfig();
  });

  test("production defaults match main (poisson × DC ρ=0.075, maxGoals=5, α=0.75)", () => {
    expect(SCORE_MODEL_FAMILY).toBe("poisson");
    expect(getScoreModelFamily()).toBe("poisson");
    expect(DIXON_COLES_RHO).toBe(0.075);
    expect(getDixonColesRho()).toBe(0.075);
    expect(SCORE_MATRIX_MAX_GOALS).toBe(5);
    expect(getScoreMatrixMaxGoals()).toBe(5);
    expect(SCORE_MATRIX_ALPHA).toBe(0.75);
    expect(getScoreMatrixAlpha()).toBe(0.75);
  });

  test("each family sums to 1 after normalise", () => {
    const families = ["poisson", "poisson_indep", "negbin", "bivariate", "zip"];
    for (const family of families) {
      const matrix = normaliseScoreMatrix(
        buildScoreMatrixForFamily(1.4, 1.1, { family, maxGoals: 5 })
      );
      expect(matrixSum(matrix)).toBeCloseTo(1, 10);
    }
  });

  test("NB with large r matches independent Poisson", () => {
    const pois = normaliseScoreMatrix(buildScoreMatrix(1.5, 1.2, 5, 0));
    const nb = normaliseScoreMatrix(
      buildNegativeBinomialScoreMatrix(1.5, 1.2, 5, 5000)
    );
    for (const cell of pois) {
      expect(cellProb(nb, cell.home, cell.away)).toBeCloseTo(
        cell.probability,
        2
      );
    }
  });

  test("ZIP with π=0 matches independent Poisson", () => {
    const pois = normaliseScoreMatrix(buildScoreMatrix(1.3, 1.0, 5, 0));
    const zip = normaliseScoreMatrix(
      buildZeroInflatedPoissonScoreMatrix(1.3, 1.0, 5, 0)
    );
    for (const cell of pois) {
      expect(cellProb(zip, cell.home, cell.away)).toBeCloseTo(
        cell.probability,
        10
      );
    }
  });

  test("bivariate with λ3=0 matches independent Poisson", () => {
    const pois = normaliseScoreMatrix(buildScoreMatrix(1.6, 1.1, 5, 0));
    const bv = normaliseScoreMatrix(
      buildBivariatePoissonScoreMatrix(1.6, 1.1, 5, 0)
    );
    for (const cell of pois) {
      expect(cellProb(bv, cell.home, cell.away)).toBeCloseTo(
        cell.probability,
        10
      );
    }
  });

  test("ZIP raises P(0-0) vs independent Poisson", () => {
    const pois = normaliseScoreMatrix(buildScoreMatrix(1.2, 1.0, 5, 0));
    const zip = normaliseScoreMatrix(
      buildZeroInflatedPoissonScoreMatrix(1.2, 1.0, 5, 0.06)
    );
    expect(cellProb(zip, 0, 0)).toBeGreaterThan(cellProb(pois, 0, 0));
  });

  test("NB raises P(4-3) vs independent Poisson", () => {
    const pois = normaliseScoreMatrix(buildScoreMatrix(1.5, 1.3, 5, 0));
    const nb = normaliseScoreMatrix(
      buildNegativeBinomialScoreMatrix(1.5, 1.3, 5, 8)
    );
    expect(cellProb(nb, 4, 3)).toBeGreaterThan(cellProb(pois, 4, 3));
  });

  test("bivariate raises P(2-2) vs independence at the same λ", () => {
    const indep = normaliseScoreMatrix(buildScoreMatrix(1.4, 1.2, 5, 0));
    const bv = normaliseScoreMatrix(
      buildBivariatePoissonScoreMatrix(1.4, 1.2, 5, 0.15)
    );
    expect(cellProb(bv, 2, 2)).toBeGreaterThan(cellProb(indep, 2, 2));
  });

  test("SCORE_MODEL_FAMILY=poisson matrix matches main ρ/α/maxGoals pipeline", () => {
    resetScoreMatrixConfig();
    const viaDispatcher = buildCalibratedScoreMatrixForFamily(1.4, 1.1);
    const viaLegacy = calibrateScoreMatrix(
      normaliseScoreMatrix(buildScoreMatrix(1.4, 1.1, 5, 0.075)),
      0.75
    );
    expect(viaDispatcher).toHaveLength(viaLegacy.length);
    for (let i = 0; i < viaLegacy.length; i += 1) {
      expect(viaDispatcher[i].home).toBe(viaLegacy[i].home);
      expect(viaDispatcher[i].away).toBe(viaLegacy[i].away);
      expect(viaDispatcher[i].probability).toBeCloseTo(
        viaLegacy[i].probability,
        12
      );
    }
  });

  test("applyScoreModelFromEnv switches family and params", () => {
    applyScoreModelFromEnv({
      SCORE_MODEL_FAMILY: "negbin",
      SCORE_NB_R: "20",
      SCORE_BIVARIATE_LAMBDA3: "0.12",
      SCORE_ZIP_PI: "0.1",
      DIXON_COLES_RHO: "0.05",
    });
    expect(getScoreModelFamily()).toBe("negbin");
    const matrix = buildScoreMatrixForFamily(1.2, 1.0);
    expect(matrixSum(normaliseScoreMatrix(matrix))).toBeCloseTo(1, 10);
  });

  test("poissonProbability and NB/ZIP helpers are non-negative", () => {
    expect(poissonProbability(0, 1.2)).toBeGreaterThan(0);
    expect(negativeBinomialProbability(2, 1.2, 12)).toBeGreaterThan(0);
    expect(zipProbability(0, 1.2, 0.05)).toBeGreaterThan(
      poissonProbability(0, 1.2)
    );
  });
});
