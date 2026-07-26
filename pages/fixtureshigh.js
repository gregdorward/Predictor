import HighestScoringFixtures from "../src/components/HighestScoringFixtures";
import { loadO25FixtureRows } from "../src/seo/statPageData";

export default function FixturesHighPage({ initialRows }) {
  return <HighestScoringFixtures initialRows={initialRows} />;
}

export async function getServerSideProps() {
  const initialRows = await loadO25FixtureRows();
  return { props: { initialRows } };
}
