import Head from "next/head";
import { useRouter } from "next/router";
import {
  OG_IMAGE,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SITE_NAME,
  getCanonicalPathFromAsPath,
  getCanonicalUrl,
  getPageMeta,
} from "../seo/pageMetaConfig";

const PageMeta = ({
  title,
  description,
  noIndex,
  canonicalPath,
  ogType = "website",
  ogImage,
  ogImageAlt,
}) => {
  const router = useRouter();
  const routePath = router?.pathname || "/";
  const defaults = getPageMeta(routePath);
  const pageTitle = title ?? defaults.title;
  const pageDescription = description ?? defaults.description;
  const shouldNoIndex = noIndex ?? defaults.noIndex ?? false;
  const resolvedPath =
    canonicalPath ??
    (router?.asPath ? getCanonicalPathFromAsPath(router.asPath) : routePath);
  const canonicalUrl = getCanonicalUrl(resolvedPath);
  const shareImage = ogImage || OG_IMAGE;
  const shareImageAlt =
    ogImageAlt || `${SITE_NAME} social share card`;
  const includeDimensions = Boolean(ogImage);

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={canonicalUrl} />
      {shouldNoIndex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={shareImage} />
      <meta property="og:image:alt" content={shareImageAlt} />
      {includeDimensions ? (
        <>
          <meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} />
          <meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />
        </>
      ) : null}
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_GB" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={shareImage} />
    </Head>
  );
};

export default PageMeta;
