import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { requestAppLoad } from "../utils/loadApp";

const Login = dynamic(() => import("./Login"), {
  ssr: false,
  loading: () => (
    <div className="GuestLanding-authSkeleton" aria-hidden="true" />
  ),
});

function scrollToGames() {
  requestAppLoad();

  const focusPredictions = () => {
    const getPredictionsButton = document.getElementById("GeneratePredictionsButton");
    if (getPredictionsButton) {
      getPredictionsButton.classList.add("flash-attention");
      setTimeout(() => {
        getPredictionsButton.classList.remove("flash-attention");
        getPredictionsButton.focus();
      }, 1000);
    }
  };

  const tryScroll = () => {
    const buttons = document.getElementById("Buttons");
    if (buttons) {
      buttons.scrollIntoView({ behavior: "smooth" });
      focusPredictions();
      return true;
    }
    return false;
  };

  if (!tryScroll()) {
    const interval = window.setInterval(() => {
      if (tryScroll()) {
        window.clearInterval(interval);
      }
    }, 100);
    window.setTimeout(() => window.clearInterval(interval), 10000);
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

const GuestLanding = ({ id = "guest-landing", showLogin = false }) => {
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
    <section className="GuestLanding" id={id} aria-label="Welcome to SoccerStatsHub">
      <div className="GuestLanding-cards">
        <div className="GuestLanding-card GuestLanding-visual">
          <div className="GuestLanding-laptop">
            <div className="GuestLanding-laptopLid">
              <div className="GuestLanding-laptopScreen">
                <Image
                  src="/images/landing-fixtures-laptop.png"
                  alt="SoccerStatsHub fixture list on laptop showing odds, win probabilities, scores and team form"
                  className="GuestLanding-screenshot"
                  width={1024}
                  height={576}
                  priority
                  sizes="(max-width: 768px) 90vw, 560px"
                />
              </div>
            </div>
            <div className="GuestLanding-laptopBase" />
          </div>
        </div>

        <div className="GuestLanding-card GuestLanding-introCard">
          <GuestLandingIntro motionEnabled={motionEnabled} activeLine={activeLine} />
        </div>

        <div
          id="guest-landing-auth-slot"
          className="GuestLanding-card GuestLanding-auth"
          aria-busy={showLogin ? "false" : "true"}
          aria-label="Sign in"
        >
          {showLogin ? <Login variant="landing" /> : null}
        </div>

        <div className="GuestLanding-card GuestLanding-about">
          <h2 className="GuestLanding-aboutTitle">Turn football data into smarter picks.</h2>
          <p>
            SoccerStatsHub gives you more than fixtures. Compare today&apos;s games with odds, win
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
