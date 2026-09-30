import SiteHeader from "../../src/components/SiteHeader";
import PageMeta from "../../src/components/PageMeta";
import JsonLd from "../../src/components/JsonLd";
import CompetitionsIndexMain from "../../src/components/CompetitionsIndexMain";
import { buildCompetitionsIndexSections } from "../../src/seo/competitionGroups";
import { SITE_URL } from "../../src/seo/pageMetaConfig";

const COMPETITIONS_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/competitions/#webpage`,
      url: `${SITE_URL}/competitions/`,
      name: "Football Competitions | Soccer Stats Hub",
      description:
        "Browse BTTS, Over 2.5, goals and league stats for 60+ football leagues and tournaments.",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      inLanguage: "en-GB",
    },
  ],
};

const COMPETITION_SECTIONS = buildCompetitionsIndexSections();

export default function CompetitionsIndexPage() {
  return (
    <>
      <PageMeta
        title="Football Competitions | Soccer Stats Hub"
        description="Browse BTTS, Over 2.5, goals, corners and card stats for 60+ football leagues and tournaments on Soccer Stats Hub."
        canonicalPath="/competitions"
      />
      <JsonLd data={COMPETITIONS_JSON_LD} />
      <SiteHeader showThemeToggle withFooter>
        <main className="StaticPage CompetitionsIndex">
          {/*
            Journey uses #ssh-content only — keep card grids outside so the in-content
            unit lands above the list, not after every competition link.
          */}
          <CompetitionsIndexMain sections={COMPETITION_SECTIONS} />
        </main>
      </SiteHeader>
    </>
  );
}
