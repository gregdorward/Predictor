import dynamic from "next/dynamic";
import PageMeta from "../src/components/PageMeta";

const PasswordReset = dynamic(
  () => import("../src/components/PasswordReset"),
  { ssr: false }
);

export default function Reset() {
  return (
    <>
      <PageMeta />
      <PasswordReset />
    </>
  );
}
