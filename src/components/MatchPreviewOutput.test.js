import { render, screen, fireEvent } from "@testing-library/react";
import MatchPreviewOutput from "./MatchPreviewOutput";

jest.mock("./CollapsableElement", () => {
  return function MockCollapsable({ buttonText, element }) {
    return (
      <div>
        <button type="button">{buttonText}</button>
        <div>{element}</div>
      </div>
    );
  };
});

jest.mock("./StarRating", () => {
  return function MockStarRating() {
    return <span data-testid="star-rating" />;
  };
});

const samplePreview = {
  matchPreview: ["First sentence. Second sentence."],
  Guide: {
    HomeGoalsPrediction: 2,
    AwayGoalsPrediction: 1,
    AnytimeGoalscorer: "Player A",
    MostCards: "Home",
    MostCorners: "Away",
    MostShotsOnTarget: "Home",
    ToBeCarded: "Player B",
  },
  homeTeam: {
    teamName: "Home FC",
    ratings: { Attack: 3 },
    keyPlayerRoles: ["Player A: runs channels"],
  },
  awayTeam: {
    teamName: "Away FC",
    ratings: { Attack: 2 },
  },
};

describe("MatchPreviewOutput", () => {
  it("uses research framing instead of AI Tips", () => {
    render(<MatchPreviewOutput preview={samplePreview} isLoading={false} />);
    expect(screen.getByText("Modelled angles")).toBeTruthy();
    expect(screen.queryByText(/AI Tips/i)).toBeNull();
    expect(screen.getByText(/research aid/i)).toBeTruthy();
  });

  it("shows error state with retry", () => {
    const onRetry = jest.fn();
    render(
      <MatchPreviewOutput
        preview={null}
        error="The preview could not be generated."
        onRetry={onRetry}
        isLoading={false}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalled();
  });
});
