const AttackingHalfSVG = () => (
  <svg className="pitchStatic" viewBox="0 0 64 50" preserveAspectRatio="xMidYMid meet">
    {/* Dark Pitch Canvas */}
    <rect width="64" height="50" fill="#111827" />
    
    {/* Clean Strategy Lines */}
    <g stroke="#334155" strokeWidth="0.6" fill="none">
      {/* Box Boundaries */}
      <rect x="0" y="0" width="64" height="50" /> {/* Outer borders */}
      <rect x="13.8" y="0" width="36.4" height="16.5" /> {/* Penalty Box */}
      <rect x="24.8" y="0" width="14.4" height="5.5" /> {/* Six Yard Box */}
      
      {/* Halfway line arc at the bottom center (32, 50) */}
      <circle cx="32" cy="50" r="9.15" />
    </g>
  </svg>
);

const SingleTeamMap = ({ teamName, boxGoals, boxShots, outGoals, outShots, accentColor = '#3b82f6' }) => {
  const boxPct = boxShots > 0 ? ((boxGoals / boxShots) * 100).toFixed(1) : "0.0";
  const outPct = outShots > 0 ? ((outGoals / outShots) * 100).toFixed(1) : "0.0";

  return (
    <div className="pitchContainer">
      {/* Team Title Banner */}
      <div style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#f8fafc', borderBottom: '1px solid #1e293b', fontSize: '14px' }}>
        {teamName}
      </div>
      
      {/* Half Pitch Graphic */}
      <AttackingHalfSVG />
      
      {/* Floating Interactive Data Layout */}
      <div className="interactiveLayer">
        
        {/* Top Box: Penalty Area */}
        <div className="zone-penalty-box" onClick={() => console.log(`${teamName} box clicked`)}>
          <div className="stat-percentage" style={{ color: accentColor }}>{boxPct}%</div>
          <div className="stat-raw">({boxGoals} / {boxShots} shots)</div>
          <div className="stat-label">In The Box</div>
        </div>

        {/* Bottom Box: Long Range Area */}
        <div className="zone-outside-box" onClick={() => console.log(`${teamName} outside clicked`)}>
          <div className="stat-percentage" style={{ color: '#94a3b8' }}>{outPct}%</div>
          <div className="stat-raw">({outGoals} / {outShots} shots)</div>
          <div className="stat-label">Outside Box</div>
        </div>

      </div>
    </div>
  );
};

// Main Export Component
const MatchShotComparison = () => {
  return (
    <div className="dashboard-pitch-row">
      <SingleTeamMap 
        teamName="Manchester FC"
        boxGoals={49}
        boxShots={329}
        outGoals={5}
        outShots={163}
        accentColor="#3b82f6" /* Blue UI Accent */
      />

      <SingleTeamMap 
        teamName="London United"
        boxGoals={31}
        boxShots={215}
        outGoals={4}
        outShots={100}
        accentColor="#ef4444" /* Red UI Accent */
      />
    </div>
  );
};

export default MatchShotComparison;