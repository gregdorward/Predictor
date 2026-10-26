import dynamic from "next/dynamic";

const AdSenseUnitInner = dynamic(() => import("./AdSenseUnitInner"), {
  ssr: false,
  loading: () => (
    <div className="AdSenseUnit AdSenseUnit--placeholder" aria-hidden="true" />
  ),
});

export default function AdSenseUnit(props) {
  return <AdSenseUnitInner {...props} />;
}
