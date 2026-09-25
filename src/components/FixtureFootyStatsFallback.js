import { FOOTYSTATS_FIXTURE_DISCLAIMER } from "../logic/fixturePageFootyStatsFallback";
import { formatLastFiveForm } from "../logic/fixturePageMetrics";

function formatPrematchValue(value) {
  if (value == null || value === "") {
    return "-";
  }
  const n = Number(value);
  if (Number.isFinite(n)) {
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
  }
  return value;
}

function CompareRow({ label, homeValue, awayValue }) {
  return (
    <div className="FixturePage-compareRow">
      <span className="FixturePage-compareValue FixturePage-compareValue--home">
        {homeValue}
      </span>
      <span className="FixturePage-compareLabel">{label}</span>
      <span className="FixturePage-compareValue FixturePage-compareValue--away">
        {awayValue}
      </span>
    </div>
  );
}

function CompareSection({ title, homeRows = [], awayRows = [], formatStatValue }) {
  const rows = homeRows.map((homeStat, index) => ({
    label: homeStat.label,
    homeValue: formatStatValue
      ? formatStatValue(homeStat.label, homeStat.value)
      : homeStat.value ?? "-",
    awayValue: formatStatValue
      ? formatStatValue(homeStat.label, awayRows[index]?.value)
      : awayRows[index]?.value ?? "-",
  }));

  if (!rows.length) {
    return null;
  }

  return (
    <section className="FixturePage-compareSection">
      <h3 className="FixturePage-statGroupTitle">{title}</h3>
      <div className="FixturePage-compareRows">
        {rows.map((row) => (
          <CompareRow
            key={row.label}
            label={row.label}
            homeValue={row.homeValue}
            awayValue={row.awayValue}
          />
        ))}
      </div>
    </section>
  );
}

function PrematchSection({ prematch, homeTeamName, awayTeamName }) {
  if (!prematch) {
    return null;
  }

  const rows = [
    { label: "Pre-match xG", home: prematch.homeXg, away: prematch.awayXg },
    { label: "Pre-match PPG", home: prematch.homePpg, away: prematch.awayPpg },
    {
      label: "Avg goals potential (%)",
      home: prematch.avgGoals,
      away: prematch.avgGoals,
    },
    {
      label: "Over 2.5 potential (%)",
      home: prematch.o25Potential,
      away: prematch.o25Potential,
    },
    {
      label: "BTTS potential (%)",
      home: prematch.bttsPotential,
      away: prematch.bttsPotential,
    },
  ];

  return (
    <section className="FixturePage-footyStatsPrematch">
      <h3 className="FixturePage-statGroupTitle">Match potentials (FootyStats)</h3>
      <div className="FixturePage-compareTeams FixturePage-compareTeams--block">
        <span className="FixturePage-compareTeam FixturePage-compareTeam--home">
          {homeTeamName}
        </span>
        <span className="FixturePage-compareTeam FixturePage-compareTeam--away">
          {awayTeamName}
        </span>
      </div>
      <div className="FixturePage-compareRows">
        {rows.map((row) => (
          <CompareRow
            key={row.label}
            label={row.label}
            homeValue={formatPrematchValue(row.home)}
            awayValue={formatPrematchValue(row.away)}
          />
        ))}
      </div>
    </section>
  );
}

function FormRunSection({ match, homeTeamName, awayTeamName }) {
  const homeForm =
    formatLastFiveForm(match?.lastFiveFormHome) ||
    formatLastFiveForm(match?.formHome?.LastFiveForm) ||
    formatLastFiveForm(match?.formHome?.formRun);
  const awayForm =
    formatLastFiveForm(match?.lastFiveFormAway) ||
    formatLastFiveForm(match?.formAway?.LastFiveForm) ||
    formatLastFiveForm(match?.formAway?.formRun);

  return (
    <section className="FixturePage-footyStatsForm">
      <h3 className="FixturePage-statGroupTitle">Recent form (FootyStats)</h3>
      <div className="FixturePage-compareTeams FixturePage-compareTeams--block">
        <span className="FixturePage-compareTeam FixturePage-compareTeam--home">
          {homeTeamName}
        </span>
        <span className="FixturePage-compareTeam FixturePage-compareTeam--away">
          {awayTeamName}
        </span>
      </div>
      <div className="FixturePage-compareRows">
        <CompareRow
          label="Last 5 form"
          homeValue={homeForm ?? "-"}
          awayValue={awayForm ?? "-"}
        />
      </div>
    </section>
  );
}

export default function FixtureFootyStatsFallback({
  match,
  sections = [],
  homeTeamName,
  awayTeamName,
  formatStatValue,
}) {
  const visibleSections = sections.filter((section) =>
    ["context", "attacking", "defensive", "tendencies"].includes(section.id)
  );

  return (
    <div className="FixturePage-footyStatsFallback">
      <p className="FixturePage-footyStatsDisclaimer" role="note">
        {FOOTYSTATS_FIXTURE_DISCLAIMER}
      </p>

      <PrematchSection
        prematch={match?.footyStatsPrematch}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
      />

      <div className="FixturePage-compareBlock">
        <div className="FixturePage-compareTeams FixturePage-compareTeams--block">
          <span className="FixturePage-compareTeam FixturePage-compareTeam--home">
            {homeTeamName}
          </span>
          <span className="FixturePage-compareTeam FixturePage-compareTeam--away">
            {awayTeamName}
          </span>
        </div>

        {visibleSections.map((section) => (
          <CompareSection
            key={section.id}
            title={section.title}
            homeRows={section.home}
            awayRows={section.away}
            formatStatValue={formatStatValue}
          />
        ))}
      </div>

      <FormRunSection
        match={match}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
      />
    </div>
  );
}
