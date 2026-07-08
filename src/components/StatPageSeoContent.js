import JsonLd from "./JsonLd";

function buildFaqJsonLd(faqItems) {
  if (!faqItems?.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export default function StatPageSeoContent({
  intro,
  updatedText = "Updated daily as fixture and league data refreshes.",
  relatedLinks = [],
  faqItems = [],
}) {
  const faqJsonLd = buildFaqJsonLd(faqItems);

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <section className="StatPageSeoContent" aria-label="Page overview">
        {intro ? <p>{intro}</p> : null}
        {updatedText ? (
          <p className="StatPageSeoContent__freshness">{updatedText}</p>
        ) : null}
        {relatedLinks.length > 0 ? (
          <nav className="StatPageSeoContent__links" aria-label="Related stat pages">
            <span>Related stats:</span>
            {relatedLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        ) : null}
      </section>
    </>
  );
}

export function StatPageSeoFaq({ faqItems = [] }) {
  if (!faqItems.length) return null;

  return (
    <div className="StatPageSeoContent__faq">
      <h2>FAQs</h2>
      {faqItems.map((item) => (
        <section key={item.question}>
          <h3>{item.question}</h3>
          <p>{item.answer}</p>
        </section>
      ))}
    </div>
  );
}
