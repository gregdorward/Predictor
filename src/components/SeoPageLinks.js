export default function SeoPageLinks({
  relatedLinks = [],
  relatedLabel = "Related competitions",
  ssrOnly = false,
}) {
  if (!relatedLinks.length) return null;

  return (
    <nav
      className={`SeoPageLinks${ssrOnly ? " SeoPageLinks--ssrOnly" : ""}`}
      aria-label={relatedLabel}
    >
      <p className="SeoPageLinks__relatedLabel">{relatedLabel}</p>
      <ul className="SeoPageLinks__relatedGrid">
        {relatedLinks.map((item) => (
          <li key={item.path || item.href}>
            <a href={item.path || item.href}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
