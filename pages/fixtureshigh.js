import HighestScoringFixtures from "../src/components/HighestScoringFixtures";
import { loadO25FixtureRows, loadO25TeamRows } from "../src/seo/statPageData";

export default function FixturesHighPage({ initialRows, initialTeamRows }) {
  return (
    <HighestScoringFixtures
      initialRows={initialRows}
      initialTeamRows={initialTeamRows}
    />
  );
}

export async function getServerSideProps() {
  const [initialRows, initialTeamRows] = await Promise.all([
    loadO25FixtureRows(),
    loadO25TeamRows(),
  ]);
  return { props: { initialRows, initialTeamRows } };
}
