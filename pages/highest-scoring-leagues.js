import HighestScoringLeagues from "../src/components/HighestScoringLeagues";
import {
  loadHighestScoringLeagueRows,
  loadU25Rows,
} from "../src/seo/statPageData";

export default function HighestScoringLeaguesPage({
  initialRows,
  initialLowScoringRows,
}) {
  return (
    <HighestScoringLeagues
      initialRows={initialRows}
      initialLowScoringRows={initialLowScoringRows}
    />
  );
}

export async function getServerSideProps() {
  const [initialRows, initialLowScoringRows] = await Promise.all([
    loadHighestScoringLeagueRows(),
    loadU25Rows(),
  ]);
  return { props: { initialRows, initialLowScoringRows } };
}
