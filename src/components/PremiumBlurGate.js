import { requestUpgrade } from "../logic/requestUpgrade";

/**
 * Blurs children for free users and shows an unlock CTA over the content.
 */
export default function PremiumBlurGate({ locked = false, children }) {
  if (!locked) return children;
  return (
    <div className="ComparisonChartWrap ComparisonChartWrap--locked">
      <button
        type="button"
        className="ComparisonChartUnlock"
        onClick={() => requestUpgrade()}
      >
        🔒 Unlock with Premium
      </button>
      {children}
    </div>
  );
}
