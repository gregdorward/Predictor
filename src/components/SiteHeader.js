import Logo from "./Logo";
import HamburgerMenu from "./HamburgerMenu";
import ThemeToggle from "./DarkModeToggle";
import WorldCupBanner from "./WorldCupBanner";

export default function SiteHeader({ showThemeToggle = false }) {
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
    </>
  );
}
