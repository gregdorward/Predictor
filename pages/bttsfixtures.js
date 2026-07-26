import BTTSFixtures from "../src/components/BTTSFixtures";
import { loadBttsFixtureRows } from "../src/seo/statPageData";

export default function BttsFixturesPage({ initialRows }) {
  return <BTTSFixtures initialRows={initialRows} />;
}

export async function getServerSideProps() {
  const initialRows = await loadBttsFixtureRows();
  return { props: { initialRows } };
}
