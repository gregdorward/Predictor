export default function SeasonPreviewsRedirect() {
  return null;
}

/** Legacy URL — always 301 to the canonical Premier League preview. */
export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/premier-league-2026-27/",
      permanent: true,
    },
  };
}
