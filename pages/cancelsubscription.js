import dynamic from "next/dynamic";
import PageMeta from "../src/components/PageMeta";

const CancelSubscription = dynamic(
  () => import("../src/components/CancelSubscription"),
  { ssr: false }
);

export default function CancelSubscriptionPage() {
  return (
    <>
      <PageMeta />
      <CancelSubscription />
    </>
  );
}
