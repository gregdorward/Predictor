import { useState } from "react";
import Logo from "../components/Logo"
import HamburgerMenu from "./HamburgerMenu";

const leagues = [
    { name: "English Premier League 25/26", key: "English-Premier-League", season: "2025-2026" },
    { name: "English Championship 25/26", key: "English-Championship", season: "2025-2026" },
    { name: "English League One 25/26", key: "English-League-One", season: "2025-2026" },
    { name: "Spanish La Liga 25/26", key: "Spanish-La-Liga", season: "2025-2026" },
    { name: "Italian Serie A 25/26", key: "Italian-Serie-A", season: "2025-2026" },
    // Add more leagues here
];

export default function SeasonPreview() {
    const [previews, setPreviews] = useState({});
    const [loading, setLoading] = useState({});

    const fetchPreview = async (leagueKey, season) => {
        if (previews[leagueKey] || loading[leagueKey]) return;

        setLoading((prev) => ({ ...prev, [leagueKey]: true }));

        try {
            const res = await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}preview/${leagueKey}/${season}`);
            const data = await res.json();
            setPreviews((prev) => ({ ...prev, [leagueKey]: data.aiJson })); // updated to match actual shape
        } catch (err) {
            console.error("Error fetching preview:", err);
            setPreviews((prev) => ({ ...prev, [leagueKey]: { error: "Failed to load preview." } }));
        } finally {
            setLoading((prev) => ({ ...prev, [leagueKey]: false }));
        }
    };

    return (
        <><HamburgerMenu /><Logo /><div className="p-4">
            <a href="https://www.soccerstatshub.com/" className="HomeLink">Home</a>
            <h1 className="text-2xl font-bold mb-6">Season Previews</h1>
            <ul>
                {leagues.map((league) => {
                    const preview = previews[league.key];

                    return (
                        <li
                            key={league.key}
                            className="mb-8 cursor-pointer border-b pb-4"
                            onClick={() => fetchPreview(league.key, league.season)}
                        >
                            <h2 className="text-xl font-semibold mb-2">{league.name}</h2>

                            {loading[league.key] && <p className="text-gray-500">Loading preview...</p>}

                            {preview?.error && <p className="text-red-500">{preview.error}</p>}

                            {preview?.summary && (
                                <div className="mb-4">
                                    {preview.summary.split('\n').map((para, idx) => (
                                        <p key={idx} className="mb-2 text-gray-800">{para.trim()}</p>
                                    ))}
                                </div>
                            )}

                            {Array.isArray(preview?.teams) && (
                                <div>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {preview.teams
                                            .sort((a, b) => a.predictedPosition - b.predictedPosition)
                                            .map((team, idx) => (
                                                <li key={idx} className="TeamPreview">
                                                    <h4 className="TeamPreviewName">P{team.predictedPosition}. {team.name}</h4>
                                                    <p className="TeamPreviewDescription">{team.preview}</p>
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div></>
    );
}