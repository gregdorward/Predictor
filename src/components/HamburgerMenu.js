import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { SITE_NAV_LINKS } from "../seo/siteNavLinks";
import { startNavOpenAdSuppression } from "../utils/navOpenAdSuppression";

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
    const stopAdSuppression = startNavOpenAdSuppression();

    return () => {
      stopAdSuppression();
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

      {typeof document !== "undefined" && isOpen
        ? createPortal(
            <div
              className="MobileNavOverlay MobileNavOverlay--open"
              aria-hidden={false}
            >
              <nav className="NavItems" aria-label="Main navigation">
                {SITE_NAV_LINKS.map((item) => (
                  <a
                    key={item.path}
                    href={item.path}
                    className="MobileNavLink"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
