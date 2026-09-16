#!/usr/bin/env node
/**
 * Prefetch FootyStats odds_comparison via Express /match/snapshot/:id.
 *
 * - Warms S3 (via footballServer) and a local file cache under
 *   scripts/output/backtest-cache/odds-comparison/
 * - Skips match IDs that already have a local cache file (unless --force)
 * - Rate-limited: default concurrency 2, delay 300ms between queue starts
 *
 * FootyStats is only hit on S3 misses inside Express. Still: run sparingly
 * on wide date ranges with a cold S3 — thousands of match calls add up.
 *
 * Usage:
 *   npm run prefetch-match-odds -- --from 2026-08-01 --to 2026-08-07
 *   npm run prefetch-match-odds -- --from 2026-08-01 --to 2026-08-07 --force
 *   npm run prefetch-match-odds -- --from 2026-08-01 --to 2026-08-07 --concurrency 1 --delay-ms 500
 */

import { existsSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import { loadBacktestEnv } from "../src/logic/backtest/loadEnv.js";
import { eachDateInclusive, toIsoDate } from "../src/logic/backtest/dateUtils.js";
import {
  hasBestOddsCache,
  writeBestOddsCache,
} from "../src/logic/bestOddsCache.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

loadBacktestEnv();

function printHelp() {
  console.log(`Usage: npm run prefetch-match-odds -- --from YYYY-MM-DD --to YYYY-MM-DD [options]

Options:
  --from YYYY-MM-DD   Start date (required)
  --to YYYY-MM-DD     End date (required)
  --concurrency N     Parallel snapshot fetches (default: 2)
  --delay-ms N        Pause between queue starts in ms (default: 300)
  --force             Refetch even when local odds cache exists
  --dry-run           List match IDs that would be fetched; no HTTP

Notes:
  Requires NEXT_PUBLIC_EXPRESS_SERVER (footballServer) running.
  Only scans dates on or before today (best odds are match-day+).
  Local cache skip avoids repeat work; S3 may still serve without FootyStats.
  Wide cold ranges hammer FootyStats — prefer small windows, then reuse cache.
`);
}

function parseArgs(argv) {
  const args = {
    from: null,
    to: null,
    concurrency: 2,
    delayMs: 300,
    force: false,
    dryRun: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--from") args.from = argv[++i];
    else if (a === "--to") args.to = argv[++i];
    else if (a === "--concurrency") args.concurrency = Number(argv[++i]);
    else if (a === "--delay-ms") args.delayMs = Number(argv[++i]);
    else if (a === "--force") args.force = true;
    else if (a === "--dry-run") args.dryRun = true;
  }
  return args;
}

function normalizeOrigin(origin) {
  if (!origin) {
    throw new Error("NEXT_PUBLIC_EXPRESS_SERVER is not set.");
  }
  return origin.endsWith("/") ? origin : `${origin}/`;
}

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function matchesCachePath(isoDate) {
  return resolve(
    projectRoot,
    "scripts/output/backtest-cache",
    `matches-${isoDate}.json`
  );
}

function readDayMatchIds(isoDate, origin) {
  const cachedPath = matchesCachePath(isoDate);
  if (existsSync(cachedPath)) {
    try {
      const data = JSON.parse(readFileSync(cachedPath, "utf8"));
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];
      return list
        .filter((fx) => fx && fx.id != null && fx.status === "complete")
        .map((fx) => Number(fx.id))
        .filter((id) => Number.isFinite(id));
    } catch {
      /* fall through to API */
    }
  }
  return null;
}

async function fetchDayMatchIds(isoDate, origin) {
  const local = readDayMatchIds(isoDate, origin);
  if (local) return { ids: local, source: "matches-cache" };

  const res = await fetch(`${origin}matches/${isoDate}`);
  if (!res.ok) {
    return { ids: [], source: `matches-api-${res.status}` };
  }
  const data = await res.json();
  const list = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
      ? data
      : [];
  const ids = list
    .filter((fx) => fx && fx.id != null && fx.status === "complete")
    .map((fx) => Number(fx.id))
    .filter((id) => Number.isFinite(id));
  return { ids, source: "matches-api" };
}

function extractOddsComparison(payload) {
  if (!payload || typeof payload !== "object") return null;
  if (payload.odds_comparison) return payload.odds_comparison;
  if (payload.data?.odds_comparison) return payload.data.odds_comparison;
  return null;
}

async function fetchSnapshot(origin, matchId) {
  const res = await fetch(`${origin}match/snapshot/${matchId}`);
  if (!res.ok) {
    return { ok: false, status: res.status, comparison: null };
  }
  const payload = await res.json();
  return {
    ok: true,
    status: res.status,
    comparison: extractOddsComparison(payload),
  };
}

async function mapPool(items, concurrency, delayMs, worker) {
  let index = 0;
  const results = [];

  async function run() {
    while (index < items.length) {
      const i = index;
      index += 1;
      if (delayMs > 0 && i > 0) {
        await sleep(delayMs);
      }
      results[i] = await worker(items[i], i);
    }
  }

  const n = Math.max(1, Math.min(concurrency, items.length || 1));
  await Promise.all(Array.from({ length: n }, () => run()));
  return results;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.from || !args.to) {
    printHelp();
    process.exit(args.help ? 0 : 1);
  }

  const origin = normalizeOrigin(process.env.NEXT_PUBLIC_EXPRESS_SERVER);
  const concurrency = Number.isFinite(args.concurrency) && args.concurrency > 0
    ? Math.floor(args.concurrency)
    : 2;
  const delayMs = Number.isFinite(args.delayMs) && args.delayMs >= 0
    ? args.delayMs
    : 300;

  const todayIso = toIsoDate(new Date());
  let effectiveTo = args.to;
  if (args.to > todayIso) {
    console.warn(
      `Clamping --to ${args.to} → ${todayIso} (best odds only on match day or later)`
    );
    effectiveTo = todayIso;
  }
  if (args.from > todayIso) {
    console.log(
      `Nothing to prefetch: --from ${args.from} is after today (${todayIso}).`
    );
    return;
  }

  console.log(`Prefetch match odds ${args.from} → ${effectiveTo}`);
  console.log(`Express: ${origin}`);
  console.log(
    `concurrency=${concurrency} delayMs=${delayMs} force=${args.force} dryRun=${args.dryRun}`
  );
  console.log(
    "Note: FootyStats is only called when Express has no S3 snapshot yet. Prefer small ranges."
  );

  const pending = [];
  const seen = new Set();
  let skippedCached = 0;
  let days = 0;

  for (const date of eachDateInclusive(args.from, effectiveTo)) {
    const iso = toIsoDate(date);
    days += 1;
    const { ids, source } = await fetchDayMatchIds(iso, origin);
    console.log(`  ${iso}: ${ids.length} complete fixture(s) (${source})`);
    for (const id of ids) {
      const key = String(id);
      if (seen.has(key)) continue;
      seen.add(key);
      if (!args.force && hasBestOddsCache(id, projectRoot)) {
        skippedCached += 1;
        continue;
      }
      pending.push(id);
    }
  }

  console.log(
    `\nUnique fixtures: ${seen.size}; already cached: ${skippedCached}; to fetch: ${pending.length}`
  );

  if (args.dryRun) {
    console.log("Dry run — no snapshots requested.");
    if (pending.length) {
      console.log(`Would fetch e.g. ${pending.slice(0, 8).join(", ")}${pending.length > 8 ? "…" : ""}`);
    }
    return;
  }

  if (!pending.length) {
    console.log("Nothing to fetch.");
    return;
  }

  let ok = 0;
  let withComparison = 0;
  let failed = 0;

  await mapPool(pending, concurrency, delayMs, async (matchId) => {
    try {
      const result = await fetchSnapshot(origin, matchId);
      if (!result.ok) {
        failed += 1;
        console.warn(`  fail ${matchId} → HTTP ${result.status}`);
        writeBestOddsCache(matchId, null, projectRoot);
        return;
      }
      ok += 1;
      if (result.comparison) withComparison += 1;
      writeBestOddsCache(matchId, result.comparison, projectRoot);
      if (ok % 25 === 0 || ok === pending.length) {
        console.log(
          `  progress ${ok}/${pending.length} (comparison=${withComparison}, fail=${failed})`
        );
      }
    } catch (err) {
      failed += 1;
      console.warn(`  fail ${matchId} → ${err.message}`);
      writeBestOddsCache(matchId, null, projectRoot);
    }
  });

  console.log("\nDone");
  console.log(`  Days scanned: ${days}`);
  console.log(`  Fetched OK: ${ok}`);
  console.log(`  With odds_comparison: ${withComparison}`);
  console.log(`  Failed: ${failed}`);
  console.log(
    `  Local cache: scripts/output/backtest-cache/odds-comparison/`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
