import { useEffect, useState } from "react";
import { handleCheckout } from "../logic/stripeCheckout";
import { isReactSnap } from "../firebase";
import { useAuth } from "../logic/authProvider";
import { FREE_DAILY_PREDICTION_LIMIT } from "../logic/freePredictionAllowance";
import { UPGRADE_HOME_HREF } from "../logic/requestUpgrade";

const PRICE_IDS = {
  weekly: "price_1SxC9QBrqiWlVPadyHJj3Y91",
  yearly: "price_1SxCPDBrqiWlVPad3nFXzU1B",
  monthly: "price_1SxCGuBrqiWlVPadO7N4jpQJ",
};

function formatPrice(amount, currency) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: ["jpy", "krw"].includes(currency) ? 0 : 2,
  }).format(amount);
}

function detectCurrency() {
  const locale = navigator.language || "en-US";
  const regionMap = {
    "en-AU": "aud",
    "en-CA": "cad",
    "en-GB": "gbp",
    "en-SG": "sgd",
    "en-NZ": "nzd",
    "da-DK": "dkk",
    "sv-SE": "sek",
    "de-CH": "chf",
    "fr-CH": "chf",
    "ar-SA": "sar",
    "en-NG": "ngn",
    "ko-KR": "krw",
  };
  if (regionMap[locale]) return regionMap[locale];

  const language = locale.split("-")[0];
  const languageMap = {
    ja: "jpy",
    de: "eur",
    fr: "eur",
    it: "eur",
    es: "eur",
    nl: "eur",
  };
  return languageMap[language] || "usd";
}

function promptLoginOrHome() {
  const loginSection =
    document.getElementById("HamburgerMenuDiv") ||
    document.getElementById("guest-landing-auth-slot");
  const emailInput = document.getElementById("LoginSignUp");

  if (loginSection || emailInput) {
    loginSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (emailInput) {
      emailInput.classList.add("flash-attention");
      setTimeout(() => {
        emailInput.classList.remove("flash-attention");
        emailInput.focus();
      }, 1000);
    }
    return;
  }

  window.location.assign(UPGRADE_HOME_HREF);
}

const DEFAULT_FULL_DESCRIPTION = `Every fixture is free to browse. Premium unlocks unlimited predicted scores and probabilities, full tip lists, AI match previews beyond your daily allowance, deep season stats, streaks and upcoming fixtures.`;

const DEFAULT_COMPACT_DESCRIPTION =
  "Unlimited predictions, full tip lists, deep season stats, streaks, and AI previews beyond the free daily allowance.";

/**
 * @param {{
 *   variant?: "full" | "compact",
 *   headline?: string,
 *   description?: string,
 *   className?: string,
 * }} props
 */
export default function PremiumUpsell({
  variant = "full",
  headline,
  description,
  className = "",
}) {
  const { user } = useAuth();
  const [pricing, setPricing] = useState(null);
  const [currency, setCurrency] = useState("usd");
  const compact = variant === "compact";

  useEffect(() => {
    if (isReactSnap || typeof window === "undefined") return undefined;
    const nextCurrency = detectCurrency();
    setCurrency(nextCurrency);
    let cancelled = false;
    fetch(
      `${process.env.NEXT_PUBLIC_EXPRESS_SERVER}pricing?currency=${nextCurrency}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setPricing(data);
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubscribeClick = (priceId) => {
    if (user) {
      handleCheckout(priceId, currency);
      return;
    }
    promptLoginOrHome();
  };

  const title = headline || (compact ? "Unlock with Premium" : "Unlock Premium");
  const body =
    description ||
    (compact ? DEFAULT_COMPACT_DESCRIPTION : DEFAULT_FULL_DESCRIPTION);

  return (
    <div
      className={`PremiumUpsell${compact ? " PremiumUpsell--compact" : ""}${
        className ? ` ${className}` : ""
      }`}
    >
      <div className="UpsellHeader">
        {compact ? <h3>{title}</h3> : <h2>{title}</h2>}
        <p>{body}</p>
      </div>

      {compact ? (
        <ul className="PremiumUpsell-compactBenefits">
          <li>Unlimited predicted scores &amp; 1X2 probabilities</li>
          <li>Full season stats — attack, defence, possession, form</li>
          <li>Tip lists, value picks, streaks, AI previews and full chart access</li>
        </ul>
      ) : (
        <div className="FeatureComparison">
          <div className="FeatureGroup">
            <h4>Free Tier</h4>
            <ul>
              <li>Full fixture board with odds and form</li>
              <li className="limited">
                {FREE_DAILY_PREDICTION_LIMIT} predicted scores / 1X2 unlocks per day
              </li>
              <li className="limited">Sample tip lists and top-5 insights</li>
            </ul>
          </div>
          <div className="FeatureDivider">VS</div>
          <div className="FeatureGroup premium">
            <h4>Premium</h4>
            <ul>
              <li>Unlimited predictions on every match</li>
              <li>Full multi, BTTS and Over 2.5 tip lists</li>
              <li>AI match previews beyond the daily allowance</li>
              <li>Best-value and stats-based tips</li>
              <li>Deep match intel — streaks and upcoming fixtures</li>
              <li>Full season stats — attack, defence, possession and form</li>
              <li>Complete insights rankings</li>
            </ul>
          </div>
        </div>
      )}

      {pricing ? (
        <div className="SubscriptionOptions">
          <div className="OptionCard">
            <span className="Price">
              {formatPrice(pricing.weekly.amount, pricing.weekly.currency)}
              <span>/week</span>
            </span>
            <button type="button" onClick={() => handleSubscribeClick(PRICE_IDS.weekly)}>
              Get Weekly
            </button>
          </div>

          <div className="OptionCard featured">
            <div className="Badge">Best Value</div>
            <span className="Price">
              {formatPrice(pricing.yearly.amount, pricing.yearly.currency)}
              <span>/year</span>
            </span>
            <button type="button" onClick={() => handleSubscribeClick(PRICE_IDS.yearly)}>
              Go Annual
            </button>
          </div>

          <div className="OptionCard">
            <span className="Price">
              {formatPrice(pricing.monthly.amount, pricing.monthly.currency)}
              <span>/month</span>
            </span>
            <button type="button" onClick={() => handleSubscribeClick(PRICE_IDS.monthly)}>
              Get Monthly
            </button>
          </div>
        </div>
      ) : null}

      <p className="TrustNote">
        Secure payments via <strong>Stripe</strong>. Cancel anytime, no contracts.
      </p>
    </div>
  );
}
