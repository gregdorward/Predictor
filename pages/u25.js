import Under25 from "../src/components/Under25";
import { loadU25Rows } from "../src/seo/statPageData";

export default function Under25Page({ initialRows }) {
  return <Under25 initialRows={initialRows} />;
}

export async function getServerSideProps() {
  const initialRows = await loadU25Rows();
  return { props: { initialRows } };
}
