import Collapsible from "react-collapsible";

const CollapsableStats = (props) => {
  return (
    <Collapsible transitionTime={300} trigger={<button className={props.classNameButton}>{props.buttonText}</button>} className={props.className? props.className: "Collapsable"}>
      <div className={props.classNameFlex? props.classNameFlex: ""}>
      {props.children}
      </div>
    </Collapsible>
  );
};


export default CollapsableStats;