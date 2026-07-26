import BTTSTeams from "../src/components/BTTSTeams";
import { loadBttsTeamRows } from "../src/seo/statPageData";

export default function BttsTeamsPage({ initialRows }) {
  return <BTTSTeams initialRows={initialRows} />;
}

export async function getServerSideProps() {
  const initialRows = await loadBttsTeamRows();
  return { props: { initialRows } };
}
