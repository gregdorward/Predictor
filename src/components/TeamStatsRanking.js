export default function TeamRankingsTable({
  title,
  ranksHome,
  ranksAway,
  teamALabel = "Home",
  teamBLabel = "Away",
}) {
  const allMetrics = Object.keys(ranksHome);

  return (
    <>
      <h3>{title}</h3>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left",
        }}
      >
        <thead>
          <tr>
            <th style={{ borderBottom: "2px solid #ccc", padding: "0.5em" }}>
              Metric
            </th>
            <th style={{ borderBottom: "2px solid #ccc", padding: "0.5em" }}>
              Total
            </th>
            <th style={{ borderBottom: "2px solid #ccc", padding: "0.5em" }}>
              {teamALabel} Rank
            </th>
            <th style={{ borderBottom: "2px solid #ccc", padding: "0.5em" }}>
              Total
            </th>
            <th style={{ borderBottom: "2px solid #ccc", padding: "0.5em" }}>
              {teamBLabel} Rank
            </th>
          </tr>
        </thead>
        <tbody>
          {allMetrics.map((metric) => (
            <tr key={metric}>
              <td
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "0.5em",
                  whiteSpace: "nowrap",
                }}
              >
                {toLabel(metric)}
              </td>
              <td style={{ borderBottom: "1px solid #eee", padding: "0.5em" }}>
                {ranksHome[metric] ? `${ranksHome[metric].value}` : "N/A"}
              </td>
              <td style={{ borderBottom: "1px solid #eee", padding: "0.5em" }}>
                {ranksHome[metric] ? `${ranksHome[metric].rank}` : "N/A"}
              </td>
              <td style={{ borderBottom: "1px solid #eee", padding: "0.5em" }}>
                {ranksAway[metric] ? `${ranksAway[metric].value} ` : "N/A"}
              </td>
              <td style={{ borderBottom: "1px solid #eee", padding: "0.5em" }}>
                {ranksAway[metric] ? `${ranksAway[metric].rank} ` : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function toLabel(camel) {
  return camel
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}
