import {
  getGoalTimingHeatOpacity,
  GOAL_TIMING_BUCKET_LABELS,
} from "../utils/goalTimingHeatmap";
import ShareableVisual from "./ShareableVisual";
import { sanitizeImageFilename } from "../utils/captureElementImage";

function getHeatCellState(count, maxValue) {
  if (!count) {
    return { isEmpty: true, opacity: 0, strong: false };
  }

  const opacity = getGoalTimingHeatOpacity(count, maxValue);
  return { isEmpty: false, opacity, strong: opacity >= 0.55 };
}

function GoalTimingHeatRow({ rowKey, buckets, maxValue }) {
  return (
    <div className="GoalTimingHeat-team">
      <div className="GoalTimingHeat-row" role="list">
        {buckets.map((count, index) => {
          const label = GOAL_TIMING_BUCKET_LABELS[index];
          const { isEmpty, opacity, strong } = getHeatCellState(count, maxValue);

          return (
            <div
              key={`${rowKey}-${label}`}
              className={[
                "GoalTimingHeat-cell",
                isEmpty ? "GoalTimingHeat-cell--empty" : "GoalTimingHeat-cell--filled",
                strong ? "GoalTimingHeat-cell--strong" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={
                isEmpty ? undefined : { "--heat-opacity": opacity }
              }
              role="listitem"
              title={`${label}: ${count} goal${count === 1 ? "" : "s"}`}
            >
              {count > 0 ? <span>{count}</span> : null}
            </div>
          );
        })}
      </div>
      <div className="GoalTimingHeat-axis" aria-hidden="true">
        {GOAL_TIMING_BUCKET_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

function GoalTimingPair({
  heading,
  homeTeam,
  awayTeam,
  homeBuckets,
  awayBuckets,
  homeHasData,
  awayHasData,
  maxValue,
  variant = "scored",
}) {
  if (!homeHasData && !awayHasData) return null;

  return (
    <div
      className={[
        "GoalTimingHeat-block",
        variant === "conceded" ? "GoalTimingHeat-block--conceded" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h4>{heading}</h4>
      <div className="GoalTimingHeat-pair">
        {homeHasData ? (
          <GoalTimingHeatRow
            rowKey={homeTeam}
            buckets={homeBuckets}
            maxValue={maxValue}
          />
        ) : null}
        {awayHasData ? (
          <GoalTimingHeatRow
            rowKey={awayTeam}
            buckets={awayBuckets}
            maxValue={maxValue}
          />
        ) : null}
      </div>
    </div>
  );
}

export default function GoalTimingHeatStrip({
  homeTeam,
  awayTeam,
  homeData,
  awayData,
}) {
  const homeHasData = Boolean(homeData?.hasData);
  const awayHasData = Boolean(awayData?.hasData);

  if (!homeHasData && !awayHasData) return null;

  const scoredMax = Math.max(
    ...(homeData?.scored || []),
    ...(awayData?.scored || []),
    1
  );
  const concededMax = Math.max(
    ...(homeData?.conceded || []),
    ...(awayData?.conceded || []),
    1
  );

  return (
    <div className="GoalTimingHeat-comparison">
      <div className="GoalTimingHeat-labels">
        {homeHasData ? (
          <div className="GoalTimingHeat-team">
            <p className="GoalTimingHeat-teamLabel">{homeTeam}</p>
          </div>
        ) : null}
        {awayHasData ? (
          <div className="GoalTimingHeat-team">
            <p className="GoalTimingHeat-teamLabel">{awayTeam}</p>
          </div>
        ) : null}
      </div>
      <GoalTimingPair
        heading="Goals scored"
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        homeBuckets={homeData?.scored}
        awayBuckets={awayData?.scored}
        homeHasData={homeHasData}
        awayHasData={awayHasData}
        maxValue={scoredMax}
      />
      <GoalTimingPair
        heading="Goals conceded"
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        homeBuckets={homeData?.conceded}
        awayBuckets={awayData?.conceded}
        homeHasData={homeHasData}
        awayHasData={awayHasData}
        maxValue={concededMax}
        variant="conceded"
      />
    </div>
  );
}

export function GoalTimingHeatShare({
  homeTeam,
  awayTeam,
  homeData,
  awayData,
  text = "Goal timing",
}) {
  const homeHasData = Boolean(homeData?.hasData);
  const awayHasData = Boolean(awayData?.hasData);

  if (!homeHasData && !awayHasData) {
    return null;
  }

  const shareFilename = sanitizeImageFilename(
    `${homeTeam}-vs-${awayTeam}-goal-timing`
  );
  const shareTitle = `${homeTeam} vs ${awayTeam} - ${text}`;

  return (
    <ShareableVisual
      filename={shareFilename}
      shareTitle={shareTitle}
      className="GoalTimingHeat-share"
    >
      <div data-share-capture className="ComparisonBarChart GoalTimingHeat">
        <div className="GoalTimingHeat-header">
          <p className="GoalTimingHeat-title">{text}</p>
        </div>
        <GoalTimingHeatStrip
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          homeData={homeData}
          awayData={awayData}
        />
      </div>
    </ShareableVisual>
  );
}
