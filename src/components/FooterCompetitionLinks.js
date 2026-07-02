import { FEATURED_COMPETITION_SLUGS, getCompetitionBySlug } from "../seo/competitionCatalog";

export default function FooterCompetitionLinks() {
  const links = FEATURED_COMPETITION_SLUGS.map((slug) => getCompetitionBySlug(slug)).filter(
    Boolean
  );

  if (!links.length) return null;

  return (
    <nav className="Footer-competitions" aria-label="Popular competitions">
      <p className="Footer-competitionsLabel">League stats</p>
      <ul className="Footer-competitionsList">
        {links.map((competition) => (
          <li key={competition.slug}>
            <a href={`/competition/${competition.slug}/`}>{competition.name}</a>
          </li>
        ))}
        <li>
          <a href="/competitions/">All competitions</a>
        </li>
        <li>
          <a href="/fixtures/">Upcoming fixtures</a>
        </li>
      </ul>
    </nav>
  );
}
