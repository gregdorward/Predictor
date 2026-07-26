import BTTSNoTeams from "../src/components/BTTSNoTeams";
import { loadBttsNoTeamRows } from "../src/seo/statPageData";

export default function BttsNoTeamsPage({ initialRows }) {
  return <BTTSNoTeams initialRows={initialRows} />;
}

export async function getServerSideProps() {
  const initialRows = await loadBttsNoTeamRows();
  return { props: { initialRows } };
}
