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
        <div className="HamburgerMenuDiv">
            {/* Toggle Button */}
            <button
                onClick={toggleMenu}
                className="HamburgerMenuButton"
                aria-label="Toggle menu"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Full-screen Overlay Menu (Mobile) */}
            {isOpen && (
                <div className="fixed inset-0 bg-white z-40 p-6 md:hidden">
                    <nav className="NavItems">
                        {menuItems.map((item) => (
                            <a
                                key={item}
                                href={mappings[item]}
                                className="block text-2xl font-semibold hover:text-blue-500"
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

