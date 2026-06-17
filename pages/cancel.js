import dynamic from "next/dynamic";
import PageMeta from "../src/components/PageMeta";

const CancelPage = dynamic(
  () => import("../src/components/Cancel").then((m) => m.CancelPage),
  { ssr: false }
);

export default function Cancel() {
  return (
    <>
      <PageMeta />
      <CancelPage />
    </>
  );
}
