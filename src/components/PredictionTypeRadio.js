import { render } from "../utils/render";
import OptionsSlider from "./OptionsSlider";

export const SSH_TIPS = "SSH Tips";
export const AI_TIPS = "AI Tips";

export var selectedTipType = SSH_TIPS;

export function renderPredictionTypeSlider() {
  const handleChange = (isRight) => {
    selectedTipType = isRight ? AI_TIPS : SSH_TIPS;
    renderPredictionTypeSlider();
  };

  render(
    <OptionsSlider
      leftLabel="SSH Tips"
      rightLabel="AI Tips"
      isRight={selectedTipType === AI_TIPS}
      onChange={handleChange}
      ariaLabel="Prediction algorithm"
    />,
    "CheckboxTwo"
  );
}

export default renderPredictionTypeSlider;
