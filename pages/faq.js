import SiteHeader from "../src/components/SiteHeader";
import PageMeta from "../src/components/PageMeta";
import JsonLd from "../src/components/JsonLd";
import { SITE_URL } from "../src/seo/pageMetaConfig";

const FAQ_ITEMS = [
  {
    question: "What is SoccerStatsHub?",
    answer:
      "SoccerStatsHub is a football statistics and predictions website covering 50+ competitions. We provide BTTS insights, Over 2.5 analysis, league betting stats, match comparisons and daily multis backed by transparent data.",
  },
  {
    question: "How are predictions generated?",
    answer:
      "Predictions combine historical team and league data, current form, head-to-head records and market averages. Model outputs are shown alongside the stats so you can judge the reasoning yourself.",
  },
  {
    question: "Which leagues and competitions are covered?",
    answer:
      "We cover the Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Champions League, Europa League, MLS, Championship and dozens more domestic and international competitions.",
  },
  {
    question: "Is SoccerStatsHub free to use?",
    answer:
      "Core stats and fixture browsing are free. Premium features such as advanced filters and additional markets are available via subscription.",
  },
  {
    question: "How often is data updated?",
    answer:
      "Match and league data is refreshed throughout the day as fixtures complete and new odds become available. Competition pages update as new matches are played.",
  },
  {
    question: "Can I share a specific match or shortlist?",
    answer:
      "Yes. Individual matches have shareable URLs, and you can share shortlists of selected fixtures from the homepage.",
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
        <main className="StaticPage">
          <a href="/" className="HomeLink">
            Home
          </a>
          <h1>Frequently asked questions</h1>
          <div className="StaticPage-faq">
            {FAQ_ITEMS.map((item) => (
              <section key={item.question} className="StaticPage-faqItem">
                <h2>{item.question}</h2>
                <p>{item.answer}</p>
              </section>
            ))}
          </div>
        </main>
      </SiteHeader>
    </>
  );
}
