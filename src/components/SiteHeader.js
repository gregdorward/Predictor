import Logo from "./Logo";
import HamburgerMenu from "./HamburgerMenu";
import ThemeToggle from "./DarkModeToggle";
import WorldCupBanner from "./WorldCupBanner";
import Footer from "./Footer";

/** Empty-ish rail for Mediavine Journey sticky sidebar (≥300px at ≥1280px). */
function JourneySidebar() {
  return (
    <aside id="ssh-sidebar" className="SshSidebar" aria-label="Sponsored">
      <p className="SshSidebar__label">Sponsored</p>
    </aside>
  );
}

function wrapWithSidebar(children) {
  if (children == null) return null;
  return (
    <div className="SshPageShell">
      {/* Matches sidebar width so main content stays optically centred. */}
      <div className="SshPageShell__balance" aria-hidden="true" />
      <div className="SshPageShell__main">{children}</div>
      <JourneySidebar />
    </div>
  );
}

export default function SiteHeader({
  showThemeToggle = false,
  withFooter = false,
  beforeFooter = null,
  children,
}) {
  const shelled = wrapWithSidebar(children);

  const content = withFooter ? (
    <div className="SitePageLayout">
      <div className="SitePageLayout__content">{shelled}</div>
      {beforeFooter}
      <Footer />
    </div>
  ) : (
    shelled
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
