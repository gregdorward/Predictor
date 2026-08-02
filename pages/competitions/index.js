import SiteHeader from "../../src/components/SiteHeader";
import PageMeta from "../../src/components/PageMeta";
import JsonLd from "../../src/components/JsonLd";
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

const { featured, regions, other, total } = buildCompetitionsIndexSections();

function CompetitionCard({ competition, featured: isFeatured = false }) {
  return (
    <li>
      <a
        href={`/competition/${competition.slug}/`}
        className={`CompetitionsIndex-card${isFeatured ? " CompetitionsIndex-card--featured" : ""}`}
      >
        <span className="CompetitionsIndex-cardName">{competition.name}</span>
        <span className="CompetitionsIndex-cardArrow" aria-hidden="true">
          →
        </span>
      </a>
    </li>
  );
}

function CompetitionGroup({ id, label, competitions, featured: isFeatured = false }) {
  if (!competitions.length) return null;

  return (
    <section
      className={`CompetitionsIndex-group${isFeatured ? " CompetitionsIndex-group--featured" : ""}`}
      aria-labelledby={`competitions-${id}`}
    >
      <div className="CompetitionsIndex-groupHeader">
        <h2 id={`competitions-${id}`}>{label}</h2>
        <span className="CompetitionsIndex-count">{competitions.length}</span>
      </div>
      <ul className="CompetitionsIndex-grid">
        {competitions.map((competition) => (
          <CompetitionCard
            key={competition.slug}
            competition={competition}
            featured={isFeatured}
          />
        ))}
      </ul>
    </section>
  );
}

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
          <header className="CompetitionsIndex-header">
            <a href="/" className="HomeLink">
              Home
            </a>
            <h1>Football competitions</h1>
            <p className="CompetitionsIndex-intro">
              League-wide football stats for every competition we cover — average goals,
              BTTS rates, corner and card lines, home advantage and team rankings.
            </p>
            <p className="CompetitionsIndex-meta">{total} competitions indexed</p>
          </header>

          <CompetitionGroup
            id="featured"
            label="Popular"
            competitions={featured}
            featured
          />

          {regions.map((group) => (
            <CompetitionGroup
              key={group.id}
              id={group.id}
              label={group.label}
              competitions={group.competitions}
            />
          ))}

          {other.length > 0 ? (
            <CompetitionGroup id="more" label="More competitions" competitions={other} />
          ) : null}
        </main>
      </SiteHeader>
    </>
  );
}
