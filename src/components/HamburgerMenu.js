import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { SITE_NAV_LINKS } from "../seo/siteNavLinks";

const NAV_OPEN_CLASS = "ssh-nav-open";

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const { body } = document;
    if (!isOpen) {
      body.classList.remove(NAV_OPEN_CLASS);
      return undefined;
    }

    const scrollY = window.scrollY;
    body.classList.add(NAV_OPEN_CLASS);
    body.style.top = `-${scrollY}px`;

    return () => {
      body.classList.remove(NAV_OPEN_CLASS);
      body.style.top = "";
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

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
