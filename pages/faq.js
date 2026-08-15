import SiteHeader from "../src/components/SiteHeader";
import PageMeta from "../src/components/PageMeta";
import JsonLd from "../src/components/JsonLd";

const FAQ_ITEMS = [
  {
    question: "What is Soccer Stats Hub?",
    answer:
      "Soccer Stats Hub is a football statistics and predictions website for pre-match research. We cover around 50 competitions at any given time, with transparent score predictions, BTTS and Over 2.5 research, match comparisons, daily multis and model probabilities shown next to bookmaker prices.",
  },
  {
    question: "How transparent are Soccer Stats Hub predictions?",
    answer:
      "Very deliberately so. Predictions are not a sealed tip. We publish how the model works: completed competition fixtures feed attack and defence strengths, expected goals for each side, then a Poisson score grid with a Dixon-Coles style adjustment for low-scoring outcomes. Expand a fixture and you can see the stats and probabilities behind the number. Full detail is on our methodology page and in the article How we predict a game.",
  },
  {
    question: "How are predictions generated?",
    answer:
      "We build each team's picture from completed fixtures in the same competition, then balance attack against defence for the match ahead. That produces expected goals for home and away, which become a scoreline probability grid. From that grid we read the most likely score, home-draw-away percentages, BTTS and Over/Under 2.5. Form, xG, PPG and market context all feed in. Model outputs sit alongside the underlying stats so you can judge the reasoning yourself.",
  },
  {
    question: "How does model probability compare to bookmaker odds?",
    answer:
      "Where we have prices, we show model probability next to the probability implied by bookmaker odds, plus a value percentage when they disagree. That is research context, not a guaranteed edge. Large gaps can be noise. The useful habit is to check where the match history and the market agree, and where they do not, before you decide anything.",
  },
  {
    question: "What is BTTS / Over 2.5 research on the site?",
    answer:
      "BTTS means both teams to score. Over 2.5 means three or more goals in the match. Soccer Stats Hub has dedicated research pages for BTTS teams, BTTS fixtures, low-BTTS sides, Over 2.5 teams and high goal-potential fixtures, plus league pages that summarise BTTS and Over 2.5 rates. On the homepage you can also filter tips toward those markets and build BTTS or goals-focused multis after predictions run.",
  },
  {
    question: "How many competitions do you cover?",
    answer:
      "Around 50 competitions at any given time, including the Premier League, Championship, La Liga, Serie A, Bundesliga, Ligue 1, Champions League, Europa League, MLS and a wider set of domestic and international competitions. The list can shift with the season calendar. Browse the competitions index for the current set.",
  },
  {
    question: "Which leagues and competitions are covered?",
    answer:
      "Core coverage includes the Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Champions League, Europa League, MLS and the Championship, alongside further leagues and cups across Europe and beyond. We keep the slate around 50 competitions so prediction depth stays high rather than chasing every lower division on earth.",
  },
  {
    question: "Is Soccer Stats Hub free to use?",
    answer:
      "Yes for a meaningful free tier. Core browsing and a sample of each day's fixtures are free, including key stats and a limited tip view. Free users see about a quarter of the board. Premium unlocks the full slate and deeper research tools.",
  },
  {
    question: "What does Premium unlock, and how much is it?",
    answer:
      "Premium unlocks every match across the competitions we cover, full multi, BTTS and Over 2.5 tip lists, AI match previews, complete insights rankings, and deeper match intel such as streaks, managers, upcoming fixtures and missing-player impact. Pricing is £4.99 a month or £39.99 a year in the UK, with other currencies at checkout. Secure payments run through Stripe and you can cancel anytime.",
  },
  {
    question: "Do you use bookmaker affiliate links?",
    answer:
      "No. We deliberately avoid affiliate marketing with bookmakers. Some of those deals pay a flat fee when someone signs up and deposits. Many revenue-share programmes pay an ongoing cut of the operator's net gaming revenue from referred players, which rises when those players lose more than they win over time. We show odds so you can compare the model with the market. We do not push you toward a particular sportsbook or dress a signup bonus as advice.",
  },
  {
    question: "Is this a live scores app?",
    answer:
      "No. Soccer Stats Hub is built for pre-match research, not minute-by-minute live scores or push alerts when a goal goes in. Completed matches can show the result against the prediction, and near-term fixtures may include lineup context, but if you need a live second-screen app you should use a dedicated live-score product alongside us.",
  },
  {
    question: "Are predictions guaranteed?",
    answer:
      "No. Predictions are statistical models and research aids, not guarantees. Teams change shape overnight, red cards happen, and finishing luck swings results. If you use football stats for betting research, follow local laws, only stake what you can afford to lose, and keep it for adults aged 18 and over. We link BeGambleAware from the site for a reason.",
  },
  {
    question: "How often is data updated?",
    answer:
      "Match and league data is refreshed throughout the day as fixtures complete and new odds become available. Competition pages update as new matches are played. Editorial hubs such as tournament previews move on a slower editorial cadence.",
  },
  {
    question: "Can I share a specific match or shortlist?",
    answer:
      "Yes. Individual matches have shareable URLs, and from the homepage you can tick fixtures into a shortlist and share that list as a URL. Some charts and comparisons can also be captured as images for sharing.",
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function FaqPage() {
  return (
    <>
      <PageMeta />
      <JsonLd data={FAQ_JSON_LD} />
      <SiteHeader showThemeToggle withFooter>
        <main className="StaticPage" id="ssh-content">
          <a href="/" className="HomeLink">
            Home
          </a>
          <h1>Frequently asked questions</h1>
          <p className="StaticPage-lead">
            Transparent football predictions, BTTS and Over 2.5 research, Premium pricing,
            and how Soccer Stats Hub compares model probability with bookmaker odds.
          </p>
          <div className="StaticPage-faq">
            {FAQ_ITEMS.map((item) => (
              <section key={item.question} className="StaticPage-faqItem">
                <h2>{item.question}</h2>
                <p>{item.answer}</p>
              </section>
            ))}
          </div>
          <p className="StaticPage-moreLinks">
            Related:{" "}
            <a href="/methodology/">Methodology</a>
            {" · "}
            <a href="/articles/how-we-predict-a-game/">How we predict a game</a>
            {" · "}
            <a href="/articles/what-sets-soccer-stats-hub-apart/">
              What sets Soccer Stats Hub apart
            </a>
            {" · "}
            <a href="/about/">About</a>
            {" · "}
            <a href="/competitions/">Competitions</a>
            {" · "}
            <a href="/bttsfixtures/">BTTS fixtures</a>
            {" · "}
            <a href="/o25/">Over 2.5 teams</a>
          </p>
        </main>
      </SiteHeader>
    </>
  );
}
