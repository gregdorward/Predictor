#!/usr/bin/env node
/**
 * One-off: build league comparison profiles from /results and POST to S3 cache.
 *
 * Usage:
 *   node scripts/generate-league-comparisons.mjs
 *   EXPRESS_SERVER=https://api.soccerstatshub.com/ node scripts/generate-league-comparisons.mjs
 *   LEAGUE_ID=12345 node scripts/generate-league-comparisons.mjs   # single league only
 */
import * as esbuild from "esbuild";
import { resolve, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { mkdirSync, writeFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const stubsDir = resolve(__dirname, "backtest-stubs");
const outFile = resolve(__dirname, ".league-comparison-bundle.mjs");

function stubPath(name) {
  return resolve(stubsDir, name);
}

const exactModuleStubs = {
  react: stubPath("react-shim.js"),
  "react-dom": stubPath("react-dom-shim.js"),
  "lucide-react": stubPath("lucide-shim.js"),
  "firebase/firestore": stubPath("firestore-shim.js"),
};

const importPathStubs = [
  { filter: /[/\\]App$/, file: "app-shim.js" },
  { filter: /[/\\]App\.js$/, file: "app-shim.js" },
  { filter: /authProvider$/, file: "auth-provider-shim.js" },
  { filter: /authProvider\.js$/, file: "auth-provider-shim.js" },
  { filter: /[/\\]firebase\.js$/, file: "firebase-shim.js" },
  { filter: /PredictionTypeRadio/, file: "prediction-type-radio-shim.js" },
  { filter: /[/\\]Increment(\.js)?$/, file: "increment-shim.js" },
  { filter: /[/\\]Slider\.js$/, file: "slider-shim.js" },
  { filter: /SliderDiff/, file: "slider-diff-shim.js" },
  { filter: /OddsRadio/, file: "odds-radio-shim.js" },
  { filter: /[/\\]render(\.js)?$/, file: "render-shim.js" },
  { filter: /hasUserPaid/, file: "has-user-paid-shim.js" },
  { filter: /compareFormTrend/, file: "compare-form-trend-shim.js" },
];

function stubResolverPlugin() {
  return {
    name: "league-comparison-stub-resolver",
    setup(build) {
      // Avoid pulling React-heavy getStats → getFixtures graph
      build.onResolve({ filter: /[/\\]getStats(\.js)?$/ }, () => ({
        path: stubPath("strength-shim.js"),
      }));

      for (const [moduleName, path] of Object.entries(exactModuleStubs)) {
        build.onResolve(
          { filter: new RegExp(`^${moduleName.replace("/", "\\/")}$`) },
          () => ({ path })
        );
      }
      for (const { filter, file } of importPathStubs) {
        build.onResolve({ filter }, () => ({ path: stubPath(file) }));
      }
      build.onResolve({ filter: /[/\\]components[/\\]/ }, () => ({
        path: stubPath("component-shim.js"),
      }));
    },
  };
}

const entryFile = resolve(__dirname, ".league-comparison-entry.mjs");
mkdirSync(__dirname, { recursive: true });
writeFileSync(
  entryFile,
  `
import { persistLeagueComparisons, buildLeagueTeamComparison } from "../src/logic/buildLeagueTeamComparison.js";

export { persistLeagueComparisons, buildLeagueTeamComparison };
`
);

await esbuild.build({
  entryPoints: [entryFile],
  outfile: outFile,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  logLevel: "warning",
  plugins: [stubResolverPlugin()],
  absWorkingDir: projectRoot,
  loader: { ".js": "jsx" },
  define: { "process.env.NODE_ENV": '"production"' },
  external: ["@aws-sdk/client-s3"],
});

const expressBaseUrl = (
  process.env.EXPRESS_SERVER ||
  process.env.NEXT_PUBLIC_EXPRESS_SERVER ||
  "http://localhost:5050/"
).replace(/\/?$/, "/");

const dateStr =
  process.env.DATE || new Date().toISOString().slice(0, 10);
const onlyLeagueId = process.env.LEAGUE_ID
  ? String(process.env.LEAGUE_ID)
  : null;

console.log(`Fetching results from ${expressBaseUrl}results …`);
const resultsRes = await fetch(`${expressBaseUrl}results`);
if (!resultsRes.ok) {
  console.error(`Failed to fetch results: ${resultsRes.status}`);
  process.exit(1);
}
const allLeagueResults = await resultsRes.json();
if (!Array.isArray(allLeagueResults) || allLeagueResults.length === 0) {
  console.error("Results payload empty");
  process.exit(1);
}

const { persistLeagueComparisons, buildLeagueTeamComparison } = await import(
  pathToFileURL(outFile).href
);

if (onlyLeagueId) {
  console.log(`Building single league ${onlyLeagueId} for ${dateStr} …`);
  const payload = await buildLeagueTeamComparison(
    allLeagueResults,
    onlyLeagueId
  );
  if (!payload) {
    console.error("No comparison payload (too few fixtures or skipped league)");
    process.exit(1);
  }
  const post = await fetch(
    `${expressBaseUrl}leagueComparison/${onlyLeagueId}/${dateStr}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    }
  );
  console.log(
    post.ok
      ? `Posted ${payload.teamCount} teams for league ${onlyLeagueId}`
      : `POST failed: ${post.status}`
  );
  process.exit(post.ok ? 0 : 1);
}

console.log(
  `Building comparisons for ${allLeagueResults.length} leagues → ${dateStr} …`
);
const result = await persistLeagueComparisons({
  allLeagueResults,
  dateStr,
  expressBaseUrl,
});
console.log(result);
