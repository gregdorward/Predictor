import { SITE_URL } from "./pageMetaConfig";

export const FOUNDER_AUTHOR_LABEL = "Greg, founder of Soccer Stats Hub";

export const METHODOLOGY_REVIEWED_AT = "2026-10-20";

export function buildFounderPersonSchema() {
  return {
    "@type": "Person",
    name: "Greg",
    jobTitle: "Founder",
    worksFor: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Soccer Stats Hub",
    },
  };
}
