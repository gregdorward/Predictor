#!/usr/bin/env node
/**
 * Parse CLI flags for npm run backtest -- --from ... --to ...
 */
export function parseBacktestArgs(argv = process.argv.slice(2)) {
  const args = {
    from: null,
    to: null,
    format: "both",
    upload: true,
    delayMs: 500,
  };

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
    } else if (token === "--help" || token === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${token}`);
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

function printHelp() {
  console.log(`Usage: npm run backtest -- --from YYYY-MM-DD --to YYYY-MM-DD [options]

Options:
  --from YYYY-MM-DD   Start date (required)
  --to YYYY-MM-DD     End date (required)
  --format json|csv|both   Output format (default: both)
  --no-upload         Skip S3 upload; write local files only
  --delay-ms N        Pause between days in ms (default: 500)

Environment:
  NEXT_PUBLIC_EXPRESS_SERVER   API base (from .env.development / .env.production)
  ID, SECRET, AWS_REGION       S3 upload credentials (footballServer/.env)
`);
}
