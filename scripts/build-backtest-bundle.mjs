#!/usr/bin/env node
import * as esbuild from "esbuild";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const stubsDir = resolve(__dirname, "backtest-stubs");
const projectRoot = resolve(__dirname, "..");

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
    name: "backtest-stub-resolver",
    setup(build) {
      for (const [moduleName, path] of Object.entries(exactModuleStubs)) {
        build.onResolve({ filter: new RegExp(`^${moduleName.replace("/", "\\/")}$`) }, () => ({
          path,
        }));
      }

      for (const { filter, file } of importPathStubs) {
        build.onResolve({ filter }, () => ({
          path: stubPath(file),
        }));
      }

      build.onResolve({ filter: /[/\\]components[/\\]/ }, () => ({
        path: stubPath("component-shim.js"),
      }));
    },
  };
}

await esbuild.build({
  entryPoints: [resolve(__dirname, "backtest-entry.mjs")],
  outfile: resolve(__dirname, ".backtest-bundle.mjs"),
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  logLevel: "info",
  plugins: [stubResolverPlugin()],
  absWorkingDir: projectRoot,
  loader: {
    ".js": "jsx",
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  external: ["@aws-sdk/client-s3"],
});

console.log("Backtest bundle written to scripts/.backtest-bundle.mjs");
