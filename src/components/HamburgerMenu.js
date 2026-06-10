import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SITE_NAV_LINKS } from "../seo/siteNavLinks";

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <div
      className={`HamburgerMenuDiv${isOpen ? " HamburgerMenuDiv--open" : ""}`}
      id="HamburgerMenuDiv"
    >
      <button
        onClick={toggleMenu}
        className="HamburgerMenuButton"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      <div
        className={`MobileNavOverlay${isOpen ? " MobileNavOverlay--open" : ""}`}
        aria-hidden={!isOpen}
      >
        <nav className="NavItems" aria-label="Main navigation">
          {SITE_NAV_LINKS.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className="MobileNavLink"
              onClick={() => setIsOpen(false)}
              tabIndex={isOpen ? 0 : -1}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
