import { useEffect, useState } from "react";
import Login from "./Login";

function scrollToGames() {
  const buttons = document.getElementById("Buttons");
  if (buttons) {
    buttons.scrollIntoView({ behavior: "smooth" });
  }
  const getPredictionsButton = document.getElementById("GeneratePredictionsButton");
  if (getPredictionsButton) {
    getPredictionsButton.classList.add("flash-attention");
    setTimeout(() => {
      getPredictionsButton.classList.remove("flash-attention");
      getPredictionsButton.focus();
    }, 1000);
  }
}

const HEADLINE_LINES = [
  <>Deep Stats.</>,
  <>Real Form.</>,
  <>
    Your <span className="TitleColouring">Edge.</span>
  </>,
];

const CYCLE_MS = 2000;

const GuestLandingIntro = ({ motionEnabled, activeLine }) => (
  <div className="GuestLanding-intro">
    <h1 className="GuestLanding-headline">
      <span className="GuestLanding-headlineLines" aria-live="polite">
        {HEADLINE_LINES.map((line, index) => (
          <span
            key={index}
            className={`GuestLanding-headlineLine${
              !motionEnabled || activeLine === index ? " is-active" : ""
            }`}
          >
            {line}
            {index < HEADLINE_LINES.length - 1 ? <br /> : null}
          </span>
        ))}
      </span>
    </h1>
    <p className="GuestLanding-subheadline">
      In-depth football statistics, analytics and transparent predictions for 50+ competitions.
    </p>
  </div>
);

const GuestLanding = () => {
  const [activeLine, setActiveLine] = useState(0);
  const [motionEnabled, setMotionEnabled] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setMotionEnabled(!media.matches);
    updateMotion();
    media.addEventListener("change", updateMotion);
    return () => media.removeEventListener("change", updateMotion);
  }, []);

  useEffect(() => {
    if (!motionEnabled) return undefined;

    const interval = window.setInterval(() => {
      setActiveLine((current) => (current + 1) % HEADLINE_LINES.length);
    }, CYCLE_MS);

    return () => window.clearInterval(interval);
  }, [motionEnabled]);

  return (
    <section className="GuestLanding" aria-label="Welcome to Soccer Stats Hub">
      <div className="GuestLanding-cards">
        <div className="GuestLanding-card GuestLanding-visual">
          <div className="GuestLanding-laptop">
            <div className="GuestLanding-laptopLid">
              <div className="GuestLanding-laptopScreen">
                <img
                  src="/images/landing-fixtures-laptop.png"
                  alt="Soccer Stats Hub fixture list on laptop showing odds, win probabilities, scores and team form"
                  className="GuestLanding-screenshot"
                  width={1024}
                  height={576}
                  loading="eager"
                />
              </div>
            </div>
            <div className="GuestLanding-laptopBase" />
          </div>
        </div>

        <div className="GuestLanding-card GuestLanding-introCard">
          <GuestLandingIntro motionEnabled={motionEnabled} activeLine={activeLine} />
        </div>

        <div className="GuestLanding-card GuestLanding-auth">
          <Login variant="landing" />
        </div>

        <div className="GuestLanding-card GuestLanding-about">
          <h2 className="GuestLanding-aboutTitle">Turn football data into smarter picks.</h2>
          <p>
            Soccer Stats Hub gives you more than fixtures. Compare today&apos;s games with odds, win
            probabilities, predicted scores, recent form and key match trends, all in one place. Tap into
            any fixture for deeper stats, head-to-head records and AI-powered previews before you make your
            call.
          </p>
          <p>
            Start free with a sample of matches and tips. Upgrade to Premium to unlock every competition,
            full match detail, multis, BTTS and over 2.5 picks, plus the complete prediction engine.
          </p>
        </div>
      </div>

      <button
        type="button"
        className="MembersGetMoreUnderlined GuestLanding-skip"
        onClick={scrollToGames}
      >
        Just show me the games
      </button>
    </section>
  );
};

export default GuestLanding;
export { scrollToGames };
