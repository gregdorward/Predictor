import Collapsable from "./CollapsableElement";
import StarRating from "./StarRating";
import { formatMatchPreviewParagraphs } from "../utils/matchPreviewFormat";

function renderKeyPlayersList(roles) {
  return (
    <ul className="AIKeyPlayersList">
      {roles.map((role, index) => {
        const colonIndex = role.indexOf(":");
        const name =
          colonIndex === -1 ? role.trim() : role.slice(0, colonIndex).trim();
        const description =
          colonIndex === -1 ? "" : role.slice(colonIndex + 1).trim();
        return (
          <li key={index} className="AIKeyPlayerItem">
            <strong className="AIKeyPlayerName">{name}</strong>
            {description ? (
              <span className="AIKeyPlayerRole">{description}</span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function TeamRatingsBlock({ team, columnClassName = "HomeAIInsights" }) {
  if (!team) return null;
  const ratings = team.ratings || {};
  const ratingRows = [
    ["Attack", ratings.Attack],
    ["Defence", ratings.Defence],
    ["Directness", ratings.Directness],
    ["Possession", ratings.Possession],
    ["Pressing", ratings.Pressing],
    ["Accuracy", ratings.Accuracy],
    ["Set pieces", ratings.SetPieces],
    ["Discipline", ratings.Discipline],
    ["Last match", ratings.LastMatchPerformance],
    ["Overall", ratings.Overall],
  ];

  return (
    <div className={`${columnClassName} MatchPreviewTeamBlock`}>
      <h6 className="TeamName">{team.teamName}</h6>
      <p className="MatchPreviewStarLegend">Star ratings are out of 5.</p>
      {ratingRows.map(([label, value]) => (
        <div className="StarRating" key={label}>
          <span className="StarRatingHeader">
            {label} <StarRating rating={value} />
          </span>
        </div>
      ))}
      {team.style ? <div className="TeamStyle">{team.style}</div> : null}
      {team.strengths?.length ? (
        <ul className="Strengths">
          {team.strengths.map((strength, index) => (
            <li key={index}>{strength}</li>
          ))}
        </ul>
      ) : null}
      {team.weaknesses?.length ? (
        <ul className="Weaknesses">
          {team.weaknesses.map((weakness, index) => (
            <li key={index}>{weakness}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function MatchPreviewOutput({
  preview,
  error,
  onRetry,
  isLoading,
  loadingStatus,
}) {
  if (isLoading) {
    return (
      <div className="MatchPreviewLoading" role="status" aria-live="polite">
        <p className="MatchPreviewLoading__text">
          {loadingStatus || "Generating match preview…"}
        </p>
      </div>
    );
  }

  if (error && !preview) {
    return (
      <div className="MatchPreviewError" role="alert">
        <p className="MatchPreviewError__message">{error}</p>
        <p className="MatchPreviewError__hint">
          Your daily unlock for this fixture is still active. You can try again
          without using another unlock.
        </p>
        {onRetry ? (
          <button
            type="button"
            className="MatchPreviewError__retry SecondaryButton"
            onClick={onRetry}
          >
            Try again
          </button>
        ) : null}
      </div>
    );
  }

  if (!preview) return null;

  const guide = preview.Guide || {};
  const homeName = preview?.homeTeam?.teamName || "Home";
  const awayName = preview?.awayTeam?.teamName || "Away";
  const hasKeyPlayers =
    preview?.homeTeam?.keyPlayerRoles?.length > 0 ||
    preview?.awayTeam?.keyPlayerRoles?.length > 0;

  return (
    <div className="MatchPreviewOutput">
      <div
        className="MatchPreviewSection"
        role="region"
        aria-labelledby="match-preview-summary"
      >
        <h2 id="match-preview-summary" className="MatchPreviewSection__title">
          Summary
        </h2>
        {preview.matchPreview?.map((text, index) => {
          const paragraphs = formatMatchPreviewParagraphs(text);
          return (
            <div key={index} className="AIMatchPreview">
              {paragraphs.map((paragraph, pIndex) => (
                <p key={pIndex} className="MatchPreviewProse">
                  {paragraph}
                </p>
              ))}
            </div>
          );
        })}
      </div>

      <div className="AIMatchPreviewCard MatchPreviewAnglesCard">
        <h2 className="MatchPreviewAnglesCard__title">Modelled angles</h2>
        <p className="MatchPreviewAnglesCard__dek">
          {homeName} vs {awayName}
        </p>
        <ul>
          <li>
            <strong>Scoreline:</strong> {guide.HomeGoalsPrediction} -{" "}
            {guide.AwayGoalsPrediction}
          </li>
          <li>
            <strong>Goalscorer mentioned:</strong> {guide.AnytimeGoalscorer}
          </li>
          <li>
            <strong>Most cards:</strong> {guide.MostCards}
          </li>
          <li>
            <strong>Most corners:</strong> {guide.MostCorners}
          </li>
          <li>
            <strong>Most shots on target:</strong> {guide.MostShotsOnTarget}
          </li>
          <li>
            <strong>Player to be carded:</strong> {guide.ToBeCarded}
          </li>
        </ul>
        <p className="MatchPreviewDisclaimer">
          Generated from fixture stats, form and lineups. It is a research aid,
          not official Soccer Stats Hub modelling or a betting recommendation.
          Check the numbers above before you rely on it.
        </p>
      </div>

      {hasKeyPlayers ? (
        <Collapsable
          buttonText="Key player notes ☰"
          classNameButton="TeamStreaksButton"
          defaultOpen={false}
          element={
            <div className="AIContainer AIKeyPlayers">
              {preview?.homeTeam?.keyPlayerRoles?.length > 0 ? (
                <div className="HomeAIInsights">
                  <h6 className="TeamName">{preview.homeTeam.teamName}</h6>
                  {renderKeyPlayersList(preview.homeTeam.keyPlayerRoles)}
                </div>
              ) : null}
              {preview?.awayTeam?.keyPlayerRoles?.length > 0 ? (
                <div className="AwayAIInsights">
                  <h6 className="TeamName">{preview.awayTeam.teamName}</h6>
                  {renderKeyPlayersList(preview.awayTeam.keyPlayerRoles)}
                </div>
              ) : null}
            </div>
          }
        />
      ) : null}

      <Collapsable
        buttonText="Team ratings and styles ☰"
        classNameButton="TeamStreaksButton"
        defaultOpen={false}
        element={
          <div className="AIContainer MatchPreviewRatings">
            <TeamRatingsBlock team={preview.homeTeam} columnClassName="HomeAIInsights" />
            <TeamRatingsBlock
              team={preview.awayTeam}
              columnClassName="AwayAIInsights"
            />
          </div>
        }
      />
    </div>
  );
}
