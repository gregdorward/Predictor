import SiteHeader from "../src/components/SiteHeader";
import PageMeta from "../src/components/PageMeta";
import JsonLd from "../src/components/JsonLd";
import StripePolicies from "../src/components/Contact";
import { SITE_URL } from "../src/seo/pageMetaConfig";

const TERMS_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/terms/#webpage`,
  url: `${SITE_URL}/terms/`,
  name: "Terms and Conditions | Soccer Stats Hub",
  description:
    "Soccer Stats Hub subscription terms, refunds, cancellations, promotions and legal restrictions.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  inLanguage: "en-GB",
};

export default function TermsPage() {
  return (
    <>
      <PageMeta />
      <JsonLd data={TERMS_JSON_LD} />
      <SiteHeader showThemeToggle withFooter>
        <main className="StaticPage">
          <a href="/" className="HomeLink">
            Home
          </a>
          <h1>Terms and Conditions</h1>
          <StripePolicies />
        </main>
      </SiteHeader>
    </>
  );
}
