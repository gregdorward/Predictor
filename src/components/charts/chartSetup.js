import {
  Chart as ChartJS,
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  RadialLinearScale,
  ScatterController,
  SubTitle,
  Title,
  Tooltip,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { CHART_FONT_FAMILY } from "./chartPlugins";
import { prefersReducedMotion } from "./chartMotion";

let configured = false;

function configureCharts() {
  if (configured) return;
  configured = true;

  ChartJS.register(
    ArcElement,
    BarController,
    BarElement,
    CategoryScale,
    Filler,
    Legend,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    RadialLinearScale,
    ScatterController,
    SubTitle,
    Title,
    Tooltip,
    annotationPlugin
  );

  const { defaults } = ChartJS;
  defaults.font.family = CHART_FONT_FAMILY;
  defaults.font.size = 11;
  defaults.font.weight = 400;

  defaults.plugins.title.font = { size: 13, weight: 600 };
  defaults.plugins.subtitle.font = { size: 11, weight: 400 };
  defaults.plugins.legend.labels.font = { size: 11, weight: 600 };

  const tooltip = defaults.plugins.tooltip;
  tooltip.padding = 10;
  tooltip.cornerRadius = 8;
  tooltip.boxPadding = 4;
  tooltip.usePointStyle = true;
  tooltip.titleFont = { size: 12, weight: 600 };
  tooltip.bodyFont = { size: 12, weight: 400 };
  tooltip.footerFont = { size: 11, weight: 400 };
  tooltip.caretSize = 5;

  defaults.elements.line.borderCapStyle = "round";
  defaults.elements.line.borderJoinStyle = "round";
  defaults.elements.bar.borderRadius = 4;

  if (prefersReducedMotion()) {
    defaults.animation = false;
  }
}

configureCharts();

export { ChartJS };
