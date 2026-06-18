import Head from "next/head";
import { useRouter } from "next/router";
import {
  OG_IMAGE,
  SITE_NAME,
  getCanonicalUrl,
  getPageMeta,
} from "../seo/pageMetaConfig";

const PageMeta = ({ title, description, noIndex }) => {
  const router = useRouter();
  const pathname = router?.pathname || "/";
  const defaults = getPageMeta(pathname);
  const pageTitle = title ?? defaults.title;
  const pageDescription = description ?? defaults.description;
  const shouldNoIndex = noIndex ?? defaults.noIndex ?? false;
  const canonicalUrl = getCanonicalUrl(pathname);

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={canonicalUrl} />
      {shouldNoIndex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_GB" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={OG_IMAGE} />
    </Head>
  );
};

export default PageMeta;
