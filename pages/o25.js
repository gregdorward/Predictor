import Over25 from "../src/components/Over25";
import { loadO25TeamRows } from "../src/seo/statPageData";

export default function Over25Page({ initialRows }) {
  return <Over25 initialRows={initialRows} />;
}

export async function getServerSideProps() {
  const initialRows = await loadO25TeamRows();
  return { props: { initialRows } };
}
