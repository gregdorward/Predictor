/**
 * Parse CLI flags for npm run backtest -- --from ... --to ...
 */

/** Maps accepted --filter-* flag names to GlobalFilters keys. */
const FILTER_FLAG_ALIASES = {
  "filter-min-xg": "minimumXG",
  "filter-minimumxg": "minimumXG",
  "filter-minimumXG": "minimumXG",
  "filter-min-gd": "minimumGD",
  "filter-minimumgd": "minimumGD",
  "filter-minimumGD": "minimumGD",
  "filter-min-gd-hora": "minimumGDHorA",
  "filter-minimumgdhora": "minimumGDHorA",
  "filter-minimum-gd-hora": "minimumGDHorA",
  "filter-minimumGDHorA": "minimumGDHorA",
  "filter-min-last6": "minimumLast6",
  "filter-minimumlast6": "minimumLast6",
  "filter-minimumLast6": "minimumLast6",
  "filter-edge": "edge",
  "filter-maxedge": "maxEdge",
  "filter-maxEdge": "maxEdge",
  "filter-o25-edge": "O25edge",
  "filter-o25edge": "O25edge",
  "filter-O25edge": "O25edge",
  "filter-btts-edge": "BTTSedge",
  "filter-bttsedge": "BTTSedge",
  "filter-BTTSedge": "BTTSedge",
  "filter-win-prob": "winProbability",
  "filter-winprobability": "winProbability",
  "filter-winProbability": "winProbability",
  "filter-over25-prob": "over25Probability",
  "filter-over25probability": "over25Probability",
  "filter-over25Probability": "over25Probability",
  "filter-btts-prob": "bttsProbability",
  "filter-bttsprobability": "bttsProbability",
  "filter-bttsProbability": "bttsProbability",
};

function createDefaultArgs() {
  return {
    from: null,
    to: null,
    format: "both",
    upload: true,
    delayMs: 500,
    useSnapshots: null,
    replayModel: false,
    minEdge: null,
    edgeCurve: false,
    preset: null,
    filtersFile: null,
    filterOverrides: {},
    filterOddsMin: null,
    filterOddsMax: null,
    filterOmitDraws: false,
  };
}

function normalizeFilterFlag(token) {
  if (!token.startsWith("--filter-")) return null;
  const name = token.slice("--filter-".length);
  if (name === "odds-min") return { type: "oddsMin" };
  if (name === "odds-max") return { type: "oddsMax" };
  if (name === "omit-draws" || name === "omitDraws") {
    return { type: "omitDraws" };
  }
  const key = FILTER_FLAG_ALIASES[`filter-${name}`];
  if (key) return { type: "override", key };
  return null;
}

export function parseBacktestArgs(argv = process.argv.slice(2)) {
  const args = createDefaultArgs();

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === "--from") {
      args.from = argv[++i];
    } else if (token === "--to") {
      args.to = argv[++i];
    } else if (token === "--format") {
      args.format = argv[++i];
    } else if (token === "--no-upload") {
      args.upload = false;
    } else if (token === "--delay-ms") {
      args.delayMs = Number(argv[++i]);
    } else if (token === "--use-snapshots") {
      args.useSnapshots = true;
    } else if (token === "--replay-model") {
      args.replayModel = true;
      args.useSnapshots = false;
    } else if (token === "--preset") {
      args.preset = argv[++i];
    } else if (token === "--filters") {
      args.filtersFile = argv[++i];
    } else if (token === "--min-edge") {
      args.minEdge = Number(argv[++i]);
    } else if (token === "--edge-curve") {
      args.edgeCurve = true;
    } else if (token === "--help" || token === "-h") {
      printHelp();
      process.exit(0);
    } else {
      const filterFlag = normalizeFilterFlag(token);
      if (filterFlag?.type === "override") {
        args.filterOverrides[filterFlag.key] = Number(argv[++i]);
      } else if (filterFlag?.type === "oddsMin") {
        args.filterOddsMin = Number(argv[++i]);
      } else if (filterFlag?.type === "oddsMax") {
        args.filterOddsMax = Number(argv[++i]);
      } else if (filterFlag?.type === "omitDraws") {
        args.filterOmitDraws = true;
      } else {
        throw new Error(`Unknown argument: ${token}`);
      }
    }
  }

  if (!args.from || !args.to) {
    printHelp();
    throw new Error("Both --from and --to are required.");
  }

  if (!["json", "csv", "both"].includes(args.format)) {
    throw new Error('--format must be "json", "csv", or "both".');
  }

  return args;
}

export function printHelp() {
  console.log(`Usage: npm run backtest -- --from YYYY-MM-DD --to YYYY-MM-DD [options]

Options:
  --from YYYY-MM-DD   Start date (required)
  --to YYYY-MM-DD     End date (required)
  --format json|csv|both   Output format (default: both)
  --no-upload         Skip S3 upload; write local files only
  --delay-ms N        Pause between days in ms (default: 500)
  --use-snapshots     Settle using kickoff-frozen scorelines (predictedScores2)
  --replay-model      Same as default: recalculate with the current model
  --min-edge N        Report selective 1X2 metrics where model edge >= N pp
  --edge-curve        Also report ROI/volume at 2/5/8/10 pp edge thresholds

Tip filters (same as Customise Tips on the site):
  --preset NAME       Preset strategy: high_btts, value_seekers, goals_galore,
                      stats_picks, long-shots, underdogs, clear_favourites, ssh
  --filters FILE      JSON file with filter thresholds (merged after preset)
  --filter-minimumXG N        Min xG difference spread
  --filter-minimumGD N        Min overall goal-difference spread
  --filter-minimumGDHorA N    Min home/away goal-difference spread
  --filter-minimumLast6 N     Min last-6 points spread
  --filter-edge N             Min 1X2 value edge (%)
  --filter-maxEdge N          Override default max edge cap for ROI (default: 20)
  --filter-maxEdge 0          Disable max-edge ROI exclusion for this run
  --filter-O25edge N          Min over-2.5 edge (%)
  --filter-BTTSedge N         Min BTTS edge (%)
  --filter-winProbability N   Min win probability (%)
  --filter-over25Probability N  Min over-2.5 probability (%)
  --filter-bttsProbability N    Min BTTS probability (%)
  (kebab-case aliases also work, e.g. --filter-min-gd-hora)
  --filter-odds-min N     Min decimal odds for tipped outcome
  --filter-odds-max N     Max decimal odds for tipped outcome
  --filter-omit-draws     Drop draw predictions

By default the backtest recalculates scorelines with the current model.
Use --use-snapshots (or USE_RESULT_SNAPSHOTS=1) to match kickoff-frozen ROI.

Environment:
  NEXT_PUBLIC_EXPRESS_SERVER   API base (from .env.development / .env.production)
  ID, SECRET, AWS_REGION       S3 upload credentials (footballServer/.env)
  SCORE_MODEL_MARGIN           Min pp gap before 1X2 overrides Poisson mode (default: 12)
  USE_RESULT_SNAPSHOTS         1/true to use kickoff snapshots (default: off)
  MAX_OUTCOME_EDGE             Max 1X2 edge before ROI exclusion (default: 20, 0=off)
`);
}
