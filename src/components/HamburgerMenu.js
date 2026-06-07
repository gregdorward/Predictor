import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const menuItems = ['Home', 'Season Previews (BETA)', 'BTTS Teams', 'BTTS Games', 'Over 2.5 Goals Games', 'Highest Scoring Leagues', 'Lowest Scoring Leagues', 'Highest Scoring Teams'];

const mappings = {
    'Home': '/',
    'Season Previews (BETA)': '/seasonpreviews/',
    'BTTS Teams': '/bttsteams/',
    'BTTS Games': '/bttsfixtures/',
    'Over 2.5 Goals Games': '/fixtureshigh/',
    'Highest Scoring Leagues': '/o25/',
    'Lowest Scoring Leagues': '/u25/',
    'Highest Scoring Teams': '/teamshigh/',
};

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

            {isOpen && (
                <div className="MobileNavOverlay">
                    <nav className="NavItems" aria-label="Main navigation">
                        {menuItems.map((item) => (
                            <a
                                key={item}
                                href={mappings[item]}
                                className="MobileNavLink"
                                onClick={() => setIsOpen(false)}
                            >
                                {item}
                            </a>
                        ))}
                    </nav>
                </div>
            )}
        </div>
    );
}
