#!/usr/bin/env node
/**
 * Pull results.json.gz from S3 (even if /results would 404 as stale) into
 * scripts/output/backtest-cache/results.json for warm-cache backtests.
 *
 * Usage: node scripts/warm-backtest-results-cache.mjs
 */

import { gunzipSync } from "zlib";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

function applyEnv() {
  const merged = {
    ...loadEnvFile(resolve(projectRoot, "../footballServer/.env")),
    ...loadEnvFile(resolve(projectRoot, ".env.production")),
    ...loadEnvFile(resolve(projectRoot, ".env.development")),
    ...loadEnvFile(resolve(projectRoot, ".env")),
    ...loadEnvFile(resolve(projectRoot, ".env.local")),
  };
  for (const [k, v] of Object.entries(merged)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

async function streamToBuffer(body) {
  if (!body) return Buffer.alloc(0);
  if (Buffer.isBuffer(body)) return body;
  if (typeof body.transformToByteArray === "function") {
    return Buffer.from(await body.transformToByteArray());
  }
  const chunks = [];
  for await (const chunk of body) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

applyEnv();

if (!process.env.ID || !process.env.SECRET) {
  console.error("Missing ID/SECRET (footballServer/.env)");
  process.exit(1);
}

const client = new S3Client({
  region: process.env.AWS_REGION || "eu-west-2",
  credentials: {
    accessKeyId: process.env.ID,
    secretAccessKey: process.env.SECRET,
  },
});

const res = await client.send(
  new GetObjectCommand({ Bucket: "predictorfiles", Key: "results.json.gz" })
);
const buf = gunzipSync(await streamToBuffer(res.Body));
const raw = JSON.parse(buf.toString("utf8"));
const data = Array.isArray(raw) ? raw : raw?.data;
if (!Array.isArray(data)) {
  console.error("Unexpected results payload shape");
  process.exit(1);
}

const ageHours = Number.isFinite(Number(raw?.cachedAt))
  ? ((Date.now() - Number(raw.cachedAt)) / 3_600_000).toFixed(1)
  : "n/a";

const outDir = resolve(projectRoot, "scripts/output/backtest-cache");
mkdirSync(outDir, { recursive: true });
const outPath = resolve(outDir, "results.json");
writeFileSync(outPath, JSON.stringify(data));
console.log(
  `Wrote ${outPath} (${data.length} leagues, S3 ageHours=${ageHours})`
);
