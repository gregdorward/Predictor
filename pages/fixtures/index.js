import SiteHeader from "../../src/components/SiteHeader";
import PageMeta from "../../src/components/PageMeta";
import JsonLd from "../../src/components/JsonLd";
import FixturesIndexList from "../../src/components/FixturesIndexList";
import { SITE_URL } from "../../src/seo/pageMetaConfig";
import { fetchUpcomingFixtureLinks } from "../../src/seo/serverFetch";

const FIXTURES_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/fixtures/#webpage`,
      url: `${SITE_URL}/fixtures/`,
      name: "Upcoming Fixtures | Soccer Stats Hub",
      description:
        "Browse upcoming football fixtures with stats, predictions, BTTS and Over 2.5 analysis.",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      inLanguage: "en-GB",
    },
  ],
};

export default function FixturesIndexPage({ fixtures = [] }) {
  return (
    <>
      <PageMeta
        title="Upcoming Fixtures | Soccer Stats Hub"
        description="Upcoming football fixtures with head-to-head stats, form, BTTS and Over 2.5 predictions on Soccer Stats Hub."
        canonicalPath="/fixtures"
      />
      <JsonLd data={FIXTURES_JSON_LD} />
      <SiteHeader showThemeToggle withFooter>
        <main className="StaticPage FixturesIndex">
          <a href="/" className="HomeLink">
            Home
          </a>
          <h1>Upcoming fixtures</h1>
          <p>
            Match stats and predictions for games in the next few days. Each link opens a
            dedicated preview with head-to-head records, form, BTTS and Over 2.5 analysis,
            plus modelled scorelines where data is available.
          </p>
          <p>
            For wider league context, open the relevant competition hub from any fixture page
            or start from the <a href="/competitions/">competitions index</a>. Our{" "}
            <a href="/methodology/">methodology</a> page explains how probabilities are built.
          </p>
          {fixtures.length === 0 ? (
            <p>No upcoming fixtures are listed right now. Check back soon or browse today&apos;s games on the home page.</p>
          ) : (
            <FixturesIndexList fixtures={fixtures} />
          )}
        </main>
      </SiteHeader>
    </>
  );
}

export async function getServerSideProps() {
  const fixtures = await fetchUpcomingFixtureLinks({ limit: 150 });
  return { props: { fixtures } };
}
