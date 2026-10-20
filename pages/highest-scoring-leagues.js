import HighestScoringLeagues from "../src/components/HighestScoringLeagues";
import {
  loadHighestScoringLeagueRows,
  loadU25Rows,
} from "../src/seo/statPageData";

export default function HighestScoringLeaguesPage({
  initialRows,
  initialLowScoringRows,
  dataAsOf,
}) {
  return (
    <HighestScoringLeagues
      initialRows={initialRows}
      initialLowScoringRows={initialLowScoringRows}
      dataAsOf={dataAsOf}
    />
  );
}

export async function getServerSideProps() {
  const [initialRows, initialLowScoringRows] = await Promise.all([
    loadHighestScoringLeagueRows(),
    loadU25Rows(),
  ]);
  return {
    props: {
      initialRows,
      initialLowScoringRows,
      dataAsOf: new Date().toISOString().slice(0, 10),
    },
  };
}
