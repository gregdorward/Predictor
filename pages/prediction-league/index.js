import JsonLd from "../../src/components/JsonLd";
import PageMeta from "../../src/components/PageMeta";
import PredictionLeagueClient from "../../src/components/PredictionLeagueClient";
import SiteHeader from "../../src/components/SiteHeader";
import StatPageSeoContent, {
  StatPageSeoFaq,
} from "../../src/components/StatPageSeoContent";
import {
  PREDICTION_LEAGUE_STARTING_BUDGET,
  getMonthKey,
  getMonthLabel,
} from "../../src/logic/predictionLeague";
import { fetchLeaderboard } from "../../src/seo/serverFetch";
import { SITE_URL } from "../../src/seo/pageMetaConfig";

const CANONICAL_PATH = "/prediction-league";
const PAGE_URL = `${SITE_URL}/prediction-league/`;

const FAQ_ITEMS = [
  {
    question: "Who appears on this table?",
    answer:
      "Anyone with a free account who sets a display name and submits at least one slip in the current month from the home page bet slip. Generate predictions for the day's fixtures first, then add selections and submit before kick-off. Without a display name, profit may still be tracked in the app but you will not show on this public board.",
  },
  {
    question: "How is monthly profit calculated?",
    answer:
      "Each settled slip updates the running total for the calendar month. A winner adds (stake × decimal odds) minus stake. A loss subtracts the stake. Pending slips do not move the figure until every leg has a result. ROI on the table is that month's profit divided by the total staked on your slips in the same month.",
  },
  {
    question: `What are the ${PREDICTION_LEAGUE_STARTING_BUDGET} starting units?`,
    answer: `They are a virtual bank for slip tracking, not real money and not withdrawable. New accounts start on ${PREDICTION_LEAGUE_STARTING_BUDGET} units. The leaderboard ranks by profit made in the month, not by how many units remain in the bank.`,
  },
  {
    question: "What does the monthly winner receive?",
    answer:
      "The tipster with the highest profit for the calendar month receives one month of Premium on Soccer Stats Hub. That is applied to the winning account. It is not a cash prize.",
  },
  {
    question: "When does the ranking reset?",
    answer:
      "At the start of each calendar month. Only slips submitted in that month count here. The same month window applies to the Prediction League table on the home page.",
  },
];

function buildJsonLd(monthLabel) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${PAGE_URL}#webpage`,
        name: `Prediction League: ${monthLabel}`,
        description:
          "Monthly Prediction League table for Soccer Stats Hub tipsters, ranked by profit and ROI.",
        url: PAGE_URL,
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: "Prediction League",
            item: PAGE_URL,
          },
        ],
      },
    ],
  };
}

export default function PredictionLeaguePage({
  initialLeaderboard,
  monthKey,
  monthLabel,
}) {
  return (
    <>
      <PageMeta canonicalPath={CANONICAL_PATH} />
      <JsonLd data={buildJsonLd(monthLabel)} />
      <SiteHeader showThemeToggle withFooter>
        <div id="ssh-content" className="journey-content">
          <main className="StatPageMain prediction-league-page">
            <h1>Prediction League</h1>
            <p className="StatPageSubtitle">
              The {monthLabel} table ranks tipsters by profit and ROI.
            </p>

            <StatPageSeoContent
              intro="Welcome to the Soccer Stats Hub Prediction League. Each month we track the tips submitted from the homepage fixture list and rank each user based on the profit made on their predictions. Each user begins the month with a starting balance of 50 (imaginary) units which they can choose to place on short price singles, long-shots or multis. At the end of the month, the winner gets a month's free premium subscription. All you need is an account and username to take part."
              updatedText="The table refreshes when new slips go on and when games in those slips finish."
              relatedLinks={[
                { label: "Home (submit tips)", href: "/" },
                { label: "Methodology", href: "/methodology/" },
                { label: "FAQ", href: "/faq/" },
              ]}
              faqItems={FAQ_ITEMS}
            />

            <PredictionLeagueClient
              initialLeaderboard={initialLeaderboard}
              monthKey={monthKey}
            />

            <StatPageSeoFaq faqItems={FAQ_ITEMS} />
          </main>
        </div>
      </SiteHeader>
    </>
  );
}

export async function getServerSideProps() {
  const monthKey = getMonthKey();
  const monthLabel = getMonthLabel(monthKey);
  const initialLeaderboard = await fetchLeaderboard(monthKey);

  return {
    props: {
      initialLeaderboard: initialLeaderboard || [],
      monthKey,
      monthLabel,
    },
  };
}
