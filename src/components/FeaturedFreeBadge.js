export default function FeaturedFreeBadge({ show }) {
  if (!show) return null;
  return (
    <span className="FeaturedFreeBadge" aria-label="All stats free for this match">
      All stats free
    </span>
  );
}
