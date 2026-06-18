import dynamic from "next/dynamic";
import PageMeta from "../src/components/PageMeta";

const SuccessPage = dynamic(
  () => import("../src/components/Success").then((m) => m.SuccessPage),
  { ssr: false }
);

export default function Success() {
  return (
    <>
      <PageMeta />
      <SuccessPage />
    </>
  );
}
