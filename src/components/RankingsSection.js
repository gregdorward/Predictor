export default function RankingsSection({ title, metrics, ranksHome, ranksAway, teamALabel, teamBLabel }) {
    return (
      <div className="rankings-section">
        <h4 className="section-title">{title}</h4>
  
        <div className="rankings-row header">
          <div className="metric">Metric</div>
          <div className="team">{teamALabel} Ranking</div>
          <div className="team">{teamBLabel} Ranking</div>
        </div>
  
        {metrics.map((metric) => (
          <div key={metric.key} className="rankings-row"> {/* Use metric.key as the key */}
            <div className="metric">{metric.label}</div> {/* Display the label */}
  
            <div className="team">
              {ranksHome[metric.key]?.rank != null ? (
                <div className="circle blue">{ranksHome[metric.key].rank}</div>
              ) : (
                <span className="placeholder">—</span>
              )}
            </div>
  
            <div className="team">
              {ranksAway[metric.key]?.rank != null ? (
                <div className="circle red">{ranksAway[metric.key].rank}</div>
              ) : (
                <span className="placeholder">—</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }