import dynamic from "next/dynamic";
import PageMeta from "../src/components/PageMeta";
import SiteHeader from "../src/components/SiteHeader";

const TeamPage = dynamic(() => import("../src/components/Team"), {
  ssr: false,
});

export default function Fixture() {
  return (
    <>
      <PageMeta />
      <SiteHeader showThemeToggle withFooter>
        <TeamPage />
      </SiteHeader>
    </>
  );
}
