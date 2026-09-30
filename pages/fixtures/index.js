import SiteHeader from "../../src/components/SiteHeader";
import PageMeta from "../../src/components/PageMeta";
import JsonLd from "../../src/components/JsonLd";
import FixturesIndexMain from "../../src/components/FixturesIndexMain";
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
        <main className="StaticPage FixturesIndex" id="ssh-content">
          {fixtures.length === 0 ? (
            <>
              <nav className="FixturesIndex-breadcrumb" aria-label="Breadcrumb">
                <a href="/">Home</a>
                <span aria-hidden="true"> / </span>
                <span aria-current="page">Upcoming fixtures</span>
              </nav>
              <h1>Upcoming fixtures</h1>
              <p className="FixturesIndex-empty">
                No upcoming fixtures are listed right now. Check back soon or browse
                today&apos;s games on the{" "}
                <a href="/">home page</a>.
              </p>
            </>
          ) : (
            <FixturesIndexMain fixtures={fixtures} />
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
