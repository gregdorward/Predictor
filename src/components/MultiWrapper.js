import Collapsable from "./CollapsableElement";
import MultisPanelCarousel from "./MultisPanelCarousel";

export default function MultiWrapper() {
  return (
    <>
      <div id="ssh-multis-more" className="MultisMoreAnchor" tabIndex={-1} />
      <div id="MultiWrapper" className="MultisHub MultisHub--inControls">
        <Collapsable
          buttonText="Multis & acca tools"
          className="MultisHub__collapsible"
          classNameButton="MultisHub__trigger"
          classNameFlex="MultisHub__body"
          openedClassName="MultisHub__collapsible MultisHub__collapsible--open"
          collapsibleKey="MultisCollapsable"
          element={
            <>
              <MultisPanelCarousel />
              <div id="insights" className="MultisHub__insightsSlot" />
              <div id="statsInsights" className="MultisHub__insightsSlot MultisHub__formLeadersSlot" />
              <div id="valueBets" className="ValueBets MultisHub__valueBets" />
            </>
          }
        />
      </div>
      <div id="UserGeneratedTips" />
      <div id="shortlistRender" />
      <div id="ROIPlaceholder" />
    </>
  );
}
