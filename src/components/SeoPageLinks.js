function LinkList({ links, className, label }) {
  if (!links.length) return null;

  return (
    <nav className="SeoPageLinks" aria-label={label}>
      <p className="SeoPageLinks__relatedLabel">{label}</p>
      <ul className={className}>
        {links.map((item) => (
          <li key={item.path || item.href}>
            <a href={item.path || item.href}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function SeoPageLinks({ relatedLinks = [], relatedLabel = "Related competitions" }) {
  if (!relatedLinks.length) return null;

  return (
    <LinkList
      links={relatedLinks}
      className="SeoPageLinks__relatedGrid"
      label={relatedLabel}
    />
  );
}
