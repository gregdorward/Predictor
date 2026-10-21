import qrcode from "qrcode/lib/core/qrcode";

const QUIET_ZONE = 4;

export function buildFixtureQr(value) {
  const text = String(value || "").trim();
  if (!text) return null;

  const code = qrcode.create(text, { errorCorrectionLevel: "Q" });
  const size = code.modules.size;
  let d = "";
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (code.modules.get(x, y)) d += `M${x} ${y}h1v1h-1z`;
    }
  }

  return { size, quiet: QUIET_ZONE, d };
}
