import dynamic from "next/dynamic";
import PageMeta from "../src/components/PageMeta";

const TeamPage = dynamic(() => import("../src/components/Team"), {
  ssr: false,
});

export default function Fixture() {
  return (
    <>
      <PageMeta />
      <TeamPage />
    </>
  );
}
