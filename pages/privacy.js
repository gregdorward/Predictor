import SiteHeader from "../src/components/SiteHeader";
import PageMeta from "../src/components/PageMeta";
import JsonLd from "../src/components/JsonLd";
import PrivacyPolicy from "../src/components/PrivacyPolicy";
import { SITE_URL } from "../src/seo/pageMetaConfig";

const PRIVACY_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/privacy/#webpage`,
  url: `${SITE_URL}/privacy/`,
  name: "Privacy Policy | Soccer Stats Hub",
  description:
    "How Soccer Stats Hub collects, uses and protects your personal information, including account, payment and usage data.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  inLanguage: "en-GB",
};

export default function PrivacyPage() {
  return (
    <>
      <PageMeta />
      <JsonLd data={PRIVACY_JSON_LD} />
      <SiteHeader showThemeToggle withFooter>
        <main className="StaticPage">
          <a href="/" className="HomeLink">
            Home
          </a>
          <h1>Privacy Policy</h1>
          <PrivacyPolicy />
        </main>
      </SiteHeader>
    </>
  );
}
