import SiteHeader from "../src/components/SiteHeader";
import PageMeta from "../src/components/PageMeta";
import JsonLd from "../src/components/JsonLd";
import { SITE_URL } from "../src/seo/pageMetaConfig";

const METHODOLOGY_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/methodology/#webpage`,
  url: `${SITE_URL}/methodology/`,
  name: "Soccer Stats Hub Methodology",
  description:
    "How Soccer Stats Hub uses football data, form, xG, PPG, BTTS, Over/Under 2.5 and probability models to support match research.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  inLanguage: "en-GB",
};

export default function MethodologyPage() {
  return (
    <>
      <PageMeta />
      <JsonLd data={METHODOLOGY_JSON_LD} />
      <SiteHeader showThemeToggle withFooter>
        <main className="StaticPage">
          <a href="/" className="HomeLink">
            Home
          </a>
          <h1>Methodology</h1>
          <p>
            Soccer Stats Hub is built to make football prediction research more
            transparent. The site combines league-level trends, team form,
            match odds, xG, PPG, goal markets and modelled probabilities so users
            can see why a fixture may be interesting.
          </p>
          <h2>Data Inputs</h2>
          <p>
            Core match and league statistics come from industry leading stat
            websites used throughout the app, including season, fixture and team
            fields. Selected competition and player ranking views use additional
            industry leading stat website metric feeds where available.
          </p>
          <h2>Prediction Signals</h2>
          <ul>
            <li>Recent form and home/away performance windows</li>
            <li>xG for, xG against and rolling xG difference</li>
            <li>PPG, win/draw/loss rates and league position context</li>
            <li>BTTS, Over 2.5, Under 2.5 and clean sheet percentages</li>
            <li>Market odds and implied probability comparisons</li>
            <li>Correct score probabilities generated from goal expectation models</li>
          </ul>
          <h2>How To Use The Outputs</h2>
          <p>
            Treat every table and prediction as a research aid, not a guarantee.
            Start with league and team tendencies, then check the fixture page
            for form, head-to-head data, venue splits, model probability and the
            current market price.
          </p>
          <h2>Update Cadence</h2>
          <p>
            Fixture and league data refreshes as source data updates throughout
            the day. Some competition pages and tournament previews update less
            frequently when the underlying season or editorial data changes.
          </p>
          <h2>Responsible Use</h2>
          <p>
            Soccer Stats Hub is an analytical tool. Predictions are statistical
            estimates and can be wrong. Users should follow local laws and gamble
            responsibly if they use football stats for betting research.
          </p>
        </main>
      </SiteHeader>
    </>
  );
}
