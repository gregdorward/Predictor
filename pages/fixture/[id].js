import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import PageMeta from "../../src/components/PageMeta";

const TeamPage = dynamic(() => import("../../src/components/Team"), {
  ssr: false,
});

export default function FixtureById() {
  const router = useRouter();
  const { id } = router.query;
  const matchId = Array.isArray(id) ? id[0] : id;

  const title =
    matchId && router.isReady
      ? `Fixture ${matchId} | Soccer Stats Hub`
      : "Fixture | Soccer Stats Hub";

  return (
    <>
      <PageMeta title={title} />
      {router.isReady && matchId ? <TeamPage matchId={matchId} /> : null}
    </>
  );
}
