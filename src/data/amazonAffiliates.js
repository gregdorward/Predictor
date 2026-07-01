/**
 * Amazon Associates product catalogue.
 * Add new entries here; use `placements` to control where each ad appears.
 *
 * Placements:
 * - fixtures   — inline cards within the main fixture list
 * - worldcup2026 — World Cup preview page
 * - footer     — site-wide footer strip
 */
const AMAZON_PRODUCTS = [
  {
    id: "numbers-game-book",
    title: "The Numbers Game: Why Everything You Know About Football is Wrong",
    description:
      "Chris Anderson and David Sally on the stats that really matter — essential reading for data-minded football fans.",
    affiliateUrl: "https://amzn.to/3SHcfWg",
    asin: "0241963621",
    imageUrl:
      "https://images-eu.ssl-images-amazon.com/images/P/0241963621.MAIN._SCMZZZZZZZ_.jpg",
    rating: 4.2,
    ratingCount: 974,
    placements: ["fixtures", "worldcup2026", "footer"],
  },
  {
    id: "football-hackers-book",
    title: "Football Hackers: The Science and Art of a Data Revolution",
    description:
      "Christoph Biermann's inside account of football's analytics revolution — scouts, scientists and the clubs changing the game.",
    affiliateUrl: "https://amzn.to/4eUqgrd",
    asin: "1788702050",
    imageUrl:
      "https://images-eu.ssl-images-amazon.com/images/P/1788702050.MAIN._SCMZZZZZZZ_.jpg",
    rating: 4.5,
    ratingCount: 827,
    placements: ["fixtures", "footer"],
  },
  {
    id: "lego-messi-43015",
    title: "LEGO Editions Lionel Messi – Football Legend",
    description:
      "958-piece display model with two pose options — a World Cup collector's set for football and LEGO fans aged 12+.",
    affiliateUrl: "https://amzn.to/4v2KHZ3",
    asin: "B0FR9KGKYY",
    imageUrl:
      "https://images-eu.ssl-images-amazon.com/images/P/B0FR9KGKYY.MAIN._SCMZZZZZZZ_.jpg",
    rating: 4.4,
    ratingCount: 150,
    placements: ["worldcup2026", "fixtures", "footer"],
  },
  {
    id: "lego-football-43019",
    title: "LEGO Editions Football – Miniature Stadium",
    description:
      "Build a size-5 football with a hidden celebration scene inside — interactive display kit for fans aged 10+.",
    affiliateUrl: "https://amzn.to/4eFBhOd",
    asin: "B0FPXFDJ1H",
    imageUrl:
      "https://images-eu.ssl-images-amazon.com/images/P/B0FPXFDJ1H.MAIN._SCMZZZZZZZ_.jpg",
    rating: 4.8,
    ratingCount: 797,
    placements: ["worldcup2026", "fixtures"],
  },
  {
    id: "england-1990-retro-shirt",
    title: "Score Draw England 1990 World Cup Third Shirt",
    description:
      "Official licensed retro replica of England's iconic 1990 World Cup third shirt — polyester with embroidered badge.",
    affiliateUrl: "https://amzn.to/4gK7tRO",
    asin: "B0FX3F9STX",
    imageUrl:
      "https://m.media-amazon.com/images/I/41HJXYgwukL._AC_SL500_.jpg",
    rating: 4.5,
    ratingCount: 893,
    placements: ["worldcup2026", "fixtures"],
  },
  {
    id: "lg-oled48b56la-tv",
    title: "LG OLED48B56LA 48\" OLED 4K Smart TV (2025)",
    description:
      "48-inch OLED 4K panel with 120Hz refresh, Dolby Atmos and α8 AI processing — built for crisp, immersive matchday viewing.",
    affiliateUrl: "https://amzn.to/4eWvOBu",
    asin: "B0F14XRCH8",
    imageUrl:
      "https://images-eu.ssl-images-amazon.com/images/P/B0F14XRCH8.MAIN._SCMZZZZZZZ_.jpg",
    rating: 4.5,
    ratingCount: 204,
    placements: ["worldcup2026", "fixtures", "footer"],
  },
  {
    id: "amazon-prime-uk",
    title: "Amazon Prime - 30-day free trial",
    description:
      "Stream World Cup coverage on Prime Video, plus unlimited One-Day Delivery and member-only deals. £8.99/month after trial.",
    affiliateUrl: "https://amzn.to/44rfcgt",
    asin: "B00CFM6BAO",
    imageUrl:
      "https://m.media-amazon.com/images/G/02/prime/piv/2022PrimeBrand/Prime_Logo_RGB_Prime_Blue._CB663813932_.png",
    rating: 4.6,
    ratingCount: 128000,
    placements: ["worldcup2026", "fixtures", "footer"],
  },
];

export const FIXTURE_AD_CONFIG = {
  firstAfterIndex: 3,
  interval: 8,
};

export function getAmazonAffiliateProducts(placement) {
  if (!placement) return AMAZON_PRODUCTS;
  return AMAZON_PRODUCTS.filter((product) =>
    product.placements.includes(placement)
  );
}

export function getFixtureAdSlotIndex(fixtureIndex) {
  const { firstAfterIndex, interval } = FIXTURE_AD_CONFIG;
  if (fixtureIndex < firstAfterIndex) return null;
  if ((fixtureIndex - firstAfterIndex) % interval !== 0) return null;
  return Math.floor((fixtureIndex - firstAfterIndex) / interval);
}

export function rotateProducts(products, rotationOffset = 0) {
  if (!products.length) return [];
  const offset =
    ((rotationOffset % products.length) + products.length) % products.length;
  if (!offset) return products;
  return [...products.slice(offset), ...products.slice(0, offset)];
}

export function getRotatedProduct(products, index, rotationOffset = 0) {
  if (!products.length || index == null) return null;
  const offset =
    ((rotationOffset % products.length) + products.length) % products.length;
  return products[(index + offset) % products.length];
}

export function shuffleProducts(products) {
  const shuffled = [...products];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getFixtureAdProduct(slotIndex, rotationOffset = 0) {
  const products = getAmazonAffiliateProducts("fixtures");
  return getRotatedProduct(products, slotIndex, rotationOffset);
}

export default AMAZON_PRODUCTS;
