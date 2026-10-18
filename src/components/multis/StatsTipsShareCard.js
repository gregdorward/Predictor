import ShareableVisual from "../ShareableVisual";
import { SITE_URL } from "../../seo/pageMetaConfig";
import { sanitizeImageFilename } from "../../utils/captureElementImage";
import {
  formatStatsTipMetric,
  formatStatsTipsShareDate,
  getStatsTipSection,
} from "../../utils/formatStatsTipsShareText";

const MAX_CARD_TIPS = 6;

function formatCardFixture(tip) {
  if (tip.competition) {
    return { teams: tip.game, competition: tip.competition };
  }
  return { teams: tip.game, competition: null };
}

export default function StatsTipsShareCard({ sectionId, tips }) {
  if (!tips?.length) {
    return null;
  }

  const section = getStatsTipSection(sectionId);
  const displayTips = tips.slice(0, MAX_CARD_TIPS);
  const hiddenCount = tips.length - displayTips.length;
  const filename = sanitizeImageFilename(`stats-tips-${section.id}`);

  return (
    <ShareableVisual
      className="MultisHub__statsShareable"
      filename={`${filename}.png`}
      shareTitle={`Stats-based tips · ${section.label}`}
      shareText={`Stat differentials for today's fixtures — ${SITE_URL}`}
    >
      <div data-share-capture className="MultisHub__statsShareCapture">
        <header className="MultisHub__statsShareCaptureHeader">
          <p className="MultisHub__statsShareCaptureEyebrow">Stats-based tips</p>
          <h3 className="MultisHub__statsShareCaptureTitle">{section.title}</h3>
          <p className="MultisHub__statsShareCaptureDate">
            {formatStatsTipsShareDate()}
          </p>
        </header>

        <table className="MultisHub__statsShareTable">
          <thead>
            <tr>
              <th scope="col">Match</th>
              <th scope="col">Tip</th>
              <th scope="col" className="MultisHub__statsShareTableNum">
                {section.metricColumn}
              </th>
              <th scope="col" className="MultisHub__statsShareTableNum">
                Odds
              </th>
            </tr>
          </thead>
          <tbody>
            {displayTips.map((tip) => {
              const fixture = formatCardFixture(tip);
              const outcome =
                tip.outcomeSymbol && tip.outcome !== "Pending"
                  ? ` ${tip.outcomeSymbol}`
                  : "";
              return (
                <tr key={tip.id || tip.game}>
                  <td className="MultisHub__statsShareMatch">
                    <span className="MultisHub__statsShareTeams">
                      {fixture.teams}
                    </span>
                    {fixture.competition ? (
                      <span className="MultisHub__statsShareComp">
                        {fixture.competition}
                      </span>
                    ) : null}
                  </td>
                  <td className="MultisHub__statsSharePick">{tip.prediction}</td>
                  <td className="MultisHub__statsShareTableNum MultisHub__statsShareMetric">
                    {formatStatsTipMetric(tip, sectionId)}
                  </td>
                  <td className="MultisHub__statsShareTableNum MultisHub__statsShareOdds">
                    {tip.odds}
                    {outcome}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {hiddenCount > 0 ? (
          <p className="MultisHub__statsShareOverflow">
            +{hiddenCount} more on soccerstatshub.com
          </p>
        ) : null}
      </div>
    </ShareableVisual>
  );
}
