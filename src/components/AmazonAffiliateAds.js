import { useEffect, useMemo, useState } from "react";
import {
  getAmazonAffiliateProducts,
  getFixtureAdProduct,
  getFixtureAdSlotIndex,
  rotateProducts,
  shuffleProducts,
} from "../data/amazonAffiliates";
import { useAuth } from "../logic/authProvider";

/** Random starting offset per mount; shared across fixture-list ad slots on one page. */
export function useAffiliateRotationOffset(productCount) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (productCount > 0) {
      setOffset(Math.floor(Math.random() * productCount));
    }
  }, [productCount]);

  return offset;
}

function useHideAffiliateAds() {
  const { isPaidUser, loading, user } = useAuth();
  if (isPaidUser) return true;
  if (loading && user) return true;
  return false;
}

function StarRating({ rating }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25;

  return (
    <span className="AmazonAffiliate__stars" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(fullStars)}
      {hasHalf ? "½" : ""}
      {"☆".repeat(5 - fullStars - (hasHalf ? 1 : 0))}
      <span className="AmazonAffiliate__ratingValue">{rating}</span>
    </span>
  );
}

function AffiliateProductCard({ product, compact = false }) {
  return (
    <a
      href={product.affiliateUrl}
      className={`AmazonAffiliate__card${compact ? " AmazonAffiliate__card--compact" : ""}`}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      aria-label={`${product.title} on Amazon`}
    >
      <img
        src={product.imageUrl}
        alt={product.title}
        className="AmazonAffiliate__image"
        loading="lazy"
        width={compact ? 80 : 160}
        height={compact ? 80 : 160}
      />
      <div className="AmazonAffiliate__body">
        <h4 className="AmazonAffiliate__title">{product.title}</h4>
        {!compact && (
          <p className="AmazonAffiliate__description">{product.description}</p>
        )}
        <div className="AmazonAffiliate__meta">
          <StarRating rating={product.rating} />
          {!compact && product.ratingCount > 0 && (
            <span className="AmazonAffiliate__reviewCount">
              ({product.ratingCount.toLocaleString("en-GB")})
            </span>
          )}
        </div>
        <span className="AmazonAffiliate__cta">
          View on Amazon
          <span className="AmazonAffiliate__arrow" aria-hidden="true">
            →
          </span>
        </span>
      </div>
    </a>
  );
}

export function AmazonAffiliateFixtureAd({ product }) {
  if (!product) return null;

  return (
    <li className="AmazonAffiliateFixtureAd">
      <a
        href={product.affiliateUrl}
        className="AmazonAffiliateFixtureAd__link"
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        aria-label={`${product.title} on Amazon`}
      >
        <span className="AmazonAffiliateFixtureAd__lead">
          <span className="AmazonAffiliateFixtureAd__badge">SSH recommends</span>
          <StarRating rating={product.rating} />
        </span>
        <img
          src={product.imageUrl}
          alt=""
          className="AmazonAffiliateFixtureAd__image"
          loading="lazy"
          width={80}
          height={80}
        />
        <span className="AmazonAffiliateFixtureAd__copy">
          <span className="AmazonAffiliateFixtureAd__title">{product.title}</span>
          <span className="AmazonAffiliateFixtureAd__cta">
            View on Amazon
            <span className="AmazonAffiliate__arrow" aria-hidden="true">
              →
            </span>
          </span>
        </span>
      </a>
      <p className="AmazonAffiliateFixtureAd__disclosure">
        As an Amazon Associate, we earn from qualifying purchases.
      </p>
    </li>
  );
}

export function renderFixtureListItem(
  fixture,
  index,
  renderFixture,
  showAds,
  rotationOffset = 0
) {
  const items = [renderFixture(fixture, index)];

  if (showAds) {
    const slotIndex = getFixtureAdSlotIndex(index);
    const product = getFixtureAdProduct(slotIndex, rotationOffset);
    if (product) {
      items.push(
        <AmazonAffiliateFixtureAd
          key={`affiliate-ad-${slotIndex}-${product.id}`}
          product={product}
        />
      );
    }
  }

  return items;
}

export default function AmazonAffiliateAds({
  placement,
  title = "Fan picks",
  limit,
  compact = false,
  className = "",
}) {
  const hideAds = useHideAffiliateAds();
  const products = getAmazonAffiliateProducts(placement);
  const rotationOffset = useAffiliateRotationOffset(products.length);
  const productIds = useMemo(
    () => products.map((product) => product.id).join(","),
    [products]
  );
  const [shuffledProducts, setShuffledProducts] = useState(products);

  useEffect(() => {
    setShuffledProducts(shuffleProducts(getAmazonAffiliateProducts(placement)));
  }, [productIds, placement]);

  const visible = limit
    ? rotateProducts(products, rotationOffset).slice(0, limit)
    : shuffledProducts;

  if (hideAds || visible.length === 0) return null;

  return (
    <section
      className={`AmazonAffiliate${compact ? " AmazonAffiliate--compact" : ""}${className ? ` ${className}` : ""}`}
      aria-label={title}
    >
      <h3 className="AmazonAffiliate__heading">{title}</h3>
      <div className="AmazonAffiliate__grid">
        {visible.map((product) => (
          <AffiliateProductCard key={product.id} product={product} compact={compact} />
        ))}
      </div>
      <p className="AmazonAffiliate__disclosure">
        As an Amazon Associate, Soccer Stats Hub earns from qualifying purchases.
      </p>
    </section>
  );
}
