import dynamic from "next/dynamic";
import { useRouter } from "next/router";

const CompetitionPage = dynamic(() => import("../../src/components/CompetitionPage"), {
  ssr: false,
});

export default function CompetitionById() {
  const router = useRouter();
  const { id } = router.query;
  const seasonId = Array.isArray(id) ? id[0] : id;

  return router.isReady && seasonId ? (
    <CompetitionPage seasonId={seasonId} />
  ) : null;
}
