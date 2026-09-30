/** Structural break between major sections so Journey can place in-content units. */
export default function JourneyContentBreak({ children }) {
  const hasCopy =
    children != null &&
    children !== false &&
    !(typeof children === "string" && children.trim() === "");

  if (!hasCopy) {
    return (
      <div
        className="FixturePage-contentBreak FixturePage-contentBreak--adSlot"
        aria-hidden="true"
      />
    );
  }

  return <p className="FixturePage-contentBreak">{children}</p>;
}
