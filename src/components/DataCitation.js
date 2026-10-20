function formatCitationDate(value) {
  if (!value) return null;
  const date = new Date(
    String(value).includes("T") ? value : `${String(value).slice(0, 10)}T12:00:00`
  );
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DataCitation({ asOf, pageLabel = "this page" }) {
  const formatted = formatCitationDate(asOf);

  return (
    <aside className="DataCitation" aria-label="Citation guidance">
      <h2 className="DataCitation__title">Using this data</h2>
      <p>
        {formatted
          ? `Figures on ${pageLabel} were last updated on ${formatted}.`
          : `Figures on ${pageLabel} refresh as match results are processed.`}
      </p>
      <p>
        If you quote these numbers, please credit:{" "}
        <strong>Source: Soccer Stats Hub</strong> (soccerstatshub.com). A link is
        appreciated but not required.
      </p>
    </aside>
  );
}
