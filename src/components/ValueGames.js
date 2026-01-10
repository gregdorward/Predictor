import Collapsable from "../components/CollapsableElement";

const scrollToTarget = (id) => {
    const element = document.getElementById(String(id));
    if (!element) return;

    element.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
};


const TopValueGames = ({ tips, limit = 10, paid }) => {
    const minValue = 10; // Minimum value percentage to consider

    if (!tips?.length) return null;

    console.log('TopValueGames tips:', tips);

    const normalisedValueTips = tips
        .map(tip => ({
            ...tip,
            value: Number(tip.valuePercentage),
            bookieOdds: Number(tip.odds)

        }))
        .filter(tip => tip.value >= minValue)
        .sort((a, b) => b.value - a.value);

    return (
        <Collapsable
            buttonText={"Best Value Picks"}
            element={
                <div className="TopValueGames">
                    <h3>Highest Value Picks</h3>

                    <table className="ValueTable">
                        <thead className="ValueTableHeaders">
                            <tr>
                                <th className="ValueTableGameHeader">Game</th>
                                <th>Pick</th>
                                <th>Our Probability</th>
                                <th>Bookies Probability</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {normalisedValueTips.slice(0, limit).map((tip, index) => {
                                if (!paid && index > 0) return null;

                                return (
                                    <tr key={tip.id}>
                                        <td>
                                            <a
                                                href={`#${tip.id}`}
                                                className="GameLink"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    scrollToTarget(tip.id);
                                                }}
                                            >
                                                <div className="game">{tip.game}</div>
                                                <div className="competition">{tip.competition}</div>
                                            </a>
                                        </td>

                                        <td>{tip.prediction}</td>

                                        <td>{tip.ourProbability.toFixed(1)}%</td>

                                        <td>{tip.bookiesProbability.toFixed(1)}%</td>

                                        <td className="TipsValuePercentage">
                                            {tip.value.toFixed(1)}%
                                        </td>
                                    </tr>
                                );
                            })}

                            {!paid && normalisedValueTips.length > 1 && (
                                <tr className="UnlockBannerRow">
                                    <td colSpan={5}>
                                        <div className="UnlockBanner">
                                            🔒 Sign-up for as little as £1 to see{" "}
                                            <strong>{Math.min(limit, normalisedValueTips.length) - 1}</strong>{" "}
                                            more value picks
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            }
        />

    );
};

export default TopValueGames;