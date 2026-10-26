import { useRouter } from "next/router";
import Logo from "./Logo";
import HamburgerMenu from "./HamburgerMenu";
import ThemeToggle from "./DarkModeToggle";
import WorldCupBanner from "./WorldCupBanner";
import Footer from "./Footer";
import AdSenseUnit from "./AdSenseUnit";
import { ADSENSE_SLOTS } from "../constants/adsense";

function AdSidebar() {
  const router = useRouter();
  const path = router.asPath || "";
  const showRailAd =
    path.startsWith("/fixture") || path.startsWith("/competition");

  return (
    <aside id="ssh-sidebar" className="SshSidebar" aria-label="Sponsored">
      <p className="SshSidebar__label">Sponsored</p>
      {showRailAd ? (
        <AdSenseUnit
          slot={ADSENSE_SLOTS.FIXTURE_PAGE_DISPLAY}
          variant="display"
          placementId="sidebar-rail"
        />
      ) : null}
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
      <AdSidebar />
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
