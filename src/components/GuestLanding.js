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
    <h1 className="GuestLanding-title">Football stats and match previews</h1>
    <p className="GuestLanding-headline">
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
    </p>
    <p className="GuestLanding-subheadline">
      In-depth football statistics, analytics and transparent predictions for 50+ competitions.
      Research leagues, compare form and open any fixture for a statistical overview.
    </p>
  </div>
);

const GuestLanding = ({
  id = "guest-landing",
  showLogin = false,
  todayLinks = [],
}) => {
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
    <section className="GuestLanding" id={id} aria-label="Welcome to Soccer Stats Hub">
      <div className="GuestLanding-cards">
        <div className="GuestLanding-card GuestLanding-introCard">
          <GuestLandingIntro motionEnabled={motionEnabled} activeLine={activeLine} />
        </div>

        <div className="GuestLanding-card GuestLanding-visual">
          <div className="GuestLanding-laptop">
            <div className="GuestLanding-laptopLid">
              <div className="GuestLanding-laptopScreen">
                <Image
                  src="/images/landing-fixtures-laptop.png"
                  alt="Soccer Stats Hub fixture list on laptop showing odds, win probabilities, scores and team form"
                  className="GuestLanding-screenshot"
                  width={1024}
                  height={576}
                  sizes="(max-width: 700px) 92vw, 560px"
                />
              </div>
            </div>
            <div className="GuestLanding-laptopBase" />
          </div>
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
          <h2 className="GuestLanding-aboutTitle">Football statistics you can actually use</h2>
          <p>
            Soccer Stats Hub is built for fans who want all the most important pre-match data at their fingertips.
            Compare today&apos;s matches with win probabilities, predicted scorelines, recent
            form, expected goals and goal-market trends, all in one place.
          </p>
          <p>
            We cover up to 50 competitions at one time, from the Premier League and Champions League
            to MLS, the J League and international tournaments. Read how the models work on
            our <a href="/methodology/">methodology</a> page, browse the{" "}
            <a href="/competitions/">competition index</a>, or learn more{" "}
            <a href="/about/">about the site</a>.
          </p>
          <p>
            Start free with every fixture on the board and five predicted scores or
            probabilities unlocked per day. Premium unlocks unlimited predictions,
            full tip lists, AI match previews beyond that allowance, deep season
            stats, streaks and upcoming fixtures. Please gamble responsibly if
            you use the stats for betting.
          </p>
          {todayLinks.length > 0 ? (
            <nav className="GuestLanding-today" aria-label="Today's research">
              {todayLinks.map((link) => (
                <a key={link.href} href={link.href}>
                  <span>{link.label}</span>
                  {link.detail ? <strong>{link.detail}</strong> : null}
                </a>
              ))}
            </nav>
          ) : null}
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
