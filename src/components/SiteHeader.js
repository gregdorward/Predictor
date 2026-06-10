import Logo from "./Logo";
import HamburgerMenu from "./HamburgerMenu";
import ThemeToggle from "./DarkModeToggle";
import WorldCupBanner from "./WorldCupBanner";
import Footer from "./Footer";
import { SITE_NAV_LINKS } from "../seo/siteNavLinks";

export default function SiteHeader({
  showThemeToggle = false,
  withFooter = false,
  children,
}) {
  return (
    <>
      <header className="DarkMode">
        <Logo />
        <nav className="DesktopNav" aria-label="Main navigation">
          {SITE_NAV_LINKS.map((item) => (
            <a key={item.path} href={item.path} className="DesktopNav-link">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="HeaderActions">
          <HamburgerMenu />
          {showThemeToggle && <ThemeToggle />}
        </div>
      </header>
      <WorldCupBanner />
      {children}
      {withFooter && <Footer />}
    </>
  );
}
