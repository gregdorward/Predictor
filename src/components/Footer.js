import { SITE_NAV_LINKS } from "../seo/siteNavLinks";
import AmazonAffiliateAds from "./AmazonAffiliateAds";
import FooterCompetitionLinks from "./FooterCompetitionLinks";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="Footer">
      <AmazonAffiliateAds
        placement="footer"
        title="Recommended"
        limit={1}
        compact
        className="Footer-affiliates"
      />
      <FooterCompetitionLinks />
      <nav className="Footer-nav" aria-label="Site navigation">
        <ul className="Footer-navList">
          {SITE_NAV_LINKS.map((item) => (
            <li key={item.path}>
              <a href={item.path}>{item.label}</a>
            </li>
          ))}
        </ul>
      </nav>
      <p className="Footer-copy">© {year} SoccerStatsHub. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
