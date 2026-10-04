import dynamic from "next/dynamic";
import Image from "next/image";
const LANDING_LAPTOP_SIZES = "(max-width: 700px) 50vw, 280px";

function GuestLandingLaptop({ className = "" }) {
  return (
    <div className={`GuestLanding-laptop ${className}`.trim()}>
      <div className="GuestLanding-laptopLid">
        <div className="GuestLanding-laptopScreen">
          <Image
            src="/images/landing-fixtures-laptop.png"
            alt="Soccer Stats Hub fixture list on laptop showing odds, win probabilities, scores and team form"
            className="GuestLanding-screenshot"
            width={1024}
            height={576}
            sizes={LANDING_LAPTOP_SIZES}
            priority
          />
        </div>
      </div>
      <div className="GuestLanding-laptopBase" aria-hidden="true" />
    </div>
  );
}

const Login = dynamic(() => import("./Login"), {
  ssr: false,
  loading: () => (
    <div className="GuestLanding-authSkeleton" aria-hidden="true" />
  ),
});

const GuestLandingHero = () => (
  <div className="GuestLanding-intro GuestLanding-hero">
    <div className="GuestLanding-heroBrand">
      <div className="GuestLanding-heroVisual">
        <GuestLandingLaptop className="GuestLanding-laptop--hero" />
      </div>
      <div className="GuestLanding-heroCopy">
        <h1 className="GuestLanding-title">Football stats and match previews</h1>
        <p className="GuestLanding-subheadline">
          Unrivalled depth of pre-match detail across 50+ competitions.
          Transparent predictions, rich fixture intel and model reasoning you can
          inspect for yourself.
        </p>
      </div>
    </div>
  </div>
);

const GuestLanding = ({
  id = "guest-landing",
  showLogin = false,
  showMembershipNotice = false,
}) => (
  <section className="GuestLanding" id={id} aria-label="Welcome to Soccer Stats Hub">
    <div className="GuestLanding-cards">
      <div className="GuestLanding-card GuestLanding-introCard">
        <GuestLandingHero />
      </div>

      <div
        id="guest-landing-auth-slot"
        className={`GuestLanding-card GuestLanding-auth${
          showMembershipNotice ? " GuestLanding-auth--membershipPrompt" : ""
        }`}
        aria-busy={showLogin ? "false" : "true"}
        aria-label="Sign in"
      >
        {showMembershipNotice ? (
          <div
            id="guest-membership-notice"
            className="GuestLanding-membershipNotice"
            role="status"
          >
            <p className="GuestLanding-membershipNotice__title">
              An account is required for Premium membership
            </p>
            <p className="GuestLanding-membershipNotice__body">
              Sign up free or log in below. After that you can pick a weekly,
              monthly, or annual plan.
            </p>
          </div>
        ) : null}
        {showLogin ? <Login variant="landing" /> : null}
      </div>
    </div>
  </section>
);

export default GuestLanding;
