import HighestScoringLeagues from "../src/components/HighestScoringLeagues";
import { loadHighestScoringLeagueRows } from "../src/seo/statPageData";

export default function HighestScoringLeaguesPage({ initialRows }) {
  return <HighestScoringLeagues initialRows={initialRows} />;
}

export async function getServerSideProps() {
  const initialRows = await loadHighestScoringLeagueRows();
  return { props: { initialRows } };
}
