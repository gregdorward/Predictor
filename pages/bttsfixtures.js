import BTTSFixtures from "../src/components/BTTSFixtures";
import {
  loadBttsFixtureRows,
  loadBttsNoTeamRows,
  loadBttsTeamRows,
} from "../src/seo/statPageData";

export default function BttsFixturesPage({
  initialRows,
  initialTeamRows,
  initialNoTeamRows,
}) {
  return (
    <BTTSFixtures
      initialRows={initialRows}
      initialTeamRows={initialTeamRows}
      initialNoTeamRows={initialNoTeamRows}
    />
  );
}

export async function getServerSideProps() {
  const [initialRows, initialTeamRows, initialNoTeamRows] = await Promise.all([
    loadBttsFixtureRows(),
    loadBttsTeamRows(),
    loadBttsNoTeamRows(),
  ]);
  return { props: { initialRows, initialTeamRows, initialNoTeamRows } };
}
