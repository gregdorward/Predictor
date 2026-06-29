import Logo from "./Logo";
import HamburgerMenu from "./HamburgerMenu";
import ThemeToggle from "./DarkModeToggle";
import WorldCupBanner from "./WorldCupBanner";
import Footer from "./Footer";

export default function SiteHeader({
  showThemeToggle = false,
  withFooter = false,
  children,
}) {
  const content = withFooter ? (
    <div className="SitePageLayout">
      <div className="SitePageLayout__content">{children}</div>
      <Footer />
    </div>
  ) : (
    children
  );

  return (
    <>
      <header className="DarkMode">
        <Logo />
        <div className="HeaderActions">
          <HamburgerMenu />
          {showThemeToggle && <ThemeToggle />}
        </div>
      </header>
      <WorldCupBanner />
      {content}
    </>
  );
}
