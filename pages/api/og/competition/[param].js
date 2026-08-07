import { ImageResponse } from "next/og";
import {
  buildCompetitionOgCardModel,
  resolveCompetitionOgParam,
} from "../../../../src/seo/competitionOg";
import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SITE_NAME,
} from "../../../../src/seo/pageMetaConfig";
import { fetchCompetitionData } from "../../../../src/seo/serverFetch";

export const config = { runtime: "edge" };

const CACHE_CONTROL =
  "public, s-maxage=3600, stale-while-revalidate=86400";

const COLORS = {
  navy: "#020029",
  navySoft: "#030040",
  orange: "#fe8c00",
  green: "#28a04c",
  textDark: "#020029",
  textLight: "#ffffff",
  muted: "rgba(255,255,255,0.72)",
  chip: "rgba(255,255,255,0.1)",
  chipBorder: "rgba(255,255,255,0.14)",
};

function parseParam(req) {
  try {
    const { pathname } = new URL(req.url);
    const parts = pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

async function loadImageDataUrl(imageUrl) {
  if (!imageUrl) return null;
  try {
    const response = await fetch(imageUrl, {
      headers: { accept: "image/*" },
    });
    if (!response.ok) return null;
    const contentType = response.headers.get("content-type") || "image/png";
    if (!contentType.startsWith("image/")) return null;
    const buffer = await response.arrayBuffer();
    if (!buffer.byteLength) return null;
    return `data:${contentType};base64,${arrayBufferToBase64(buffer)}`;
  } catch {
    return null;
  }
}

function StatTile({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        width: 220,
        padding: "18px 20px",
        borderRadius: 18,
        backgroundColor: COLORS.chip,
        border: `1px solid ${COLORS.chipBorder}`,
      }}
    >
      <div
        style={{
          display: "flex",
          color: COLORS.muted,
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: 0.4,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          color: COLORS.textLight,
          fontSize: 44,
          fontWeight: 800,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function renderCard(model, logoSrc) {
  const metaParts = [model.country, model.season].filter(Boolean);
  const subtitle = model.seasonStarted
    ? "Season market profile and league insights"
    : "Standings, rankings and fixture insights";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: COLORS.navy,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "44px 52px 30px",
            backgroundImage: `linear-gradient(152deg, ${COLORS.navy} 0%, ${COLORS.navySoft} 50%, #12085a 100%)`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                flex: 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    backgroundColor: COLORS.green,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    color: COLORS.orange,
                    fontSize: 24,
                    fontWeight: 800,
                    letterSpacing: 1.1,
                    textTransform: "uppercase",
                  }}
                >
                  Competition Stats
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  color: COLORS.textLight,
                  fontSize: model.name.length > 28 ? 56 : 66,
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: -1.2,
                  maxWidth: 860,
                }}
              >
                {model.name}
              </div>

              {metaParts.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    color: COLORS.muted,
                    fontSize: 26,
                    fontWeight: 600,
                  }}
                >
                  {metaParts.join(" · ")}
                </div>
              ) : null}

              <div
                style={{
                  display: "flex",
                  color: COLORS.muted,
                  fontSize: 24,
                  fontWeight: 500,
                  marginTop: 4,
                }}
              >
                {subtitle}
              </div>
            </div>

            {logoSrc ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 128,
                  height: 128,
                  borderRadius: 28,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  border: `1px solid ${COLORS.chipBorder}`,
                  flexShrink: 0,
                }}
              >
                <img
                  src={logoSrc}
                  width={96}
                  height={96}
                  alt=""
                  style={{
                    width: 96,
                    height: 96,
                    objectFit: "contain",
                  }}
                />
              </div>
            ) : null}
          </div>

          {model.stats.length > 0 ? (
            <div
              style={{
                display: "flex",
                gap: 16,
                marginTop: 28,
              }}
            >
              {model.stats[0] ? (
                <StatTile
                  label={model.stats[0].label}
                  value={model.stats[0].value}
                />
              ) : null}
              {model.stats[1] ? (
                <StatTile
                  label={model.stats[1].label}
                  value={model.stats[1].value}
                />
              ) : null}
              {model.stats[2] ? (
                <StatTile
                  label={model.stats[2].label}
                  value={model.stats[2].value}
                />
              ) : null}
              {model.stats[3] ? (
                <StatTile
                  label={model.stats[3].label}
                  value={model.stats[3].value}
                />
              ) : null}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginTop: 34,
              }}
            >
              <div
                style={{
                  display: "flex",
                  color: COLORS.textLight,
                  fontSize: 30,
                  fontWeight: 700,
                }}
              >
                Explore the full league toolkit
              </div>
              <div
                style={{
                  display: "flex",
                  color: COLORS.muted,
                  fontSize: 24,
                  fontWeight: 500,
                }}
              >
                Market trends, standings, rankings and match insights in one place.
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 20,
              marginTop: 26,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                flex: 1,
              }}
            >
              {model.highlight ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 18px",
                    borderRadius: 999,
                    backgroundColor: "rgba(254,140,0,0.16)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      color: COLORS.orange,
                      fontSize: 20,
                      fontWeight: 700,
                    }}
                  >
                    {model.highlight.label}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      color: COLORS.textLight,
                      fontSize: 22,
                      fontWeight: 700,
                    }}
                  >
                    {model.highlight.team}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      color: COLORS.textLight,
                      fontSize: 22,
                      fontWeight: 800,
                    }}
                  >
                    {model.highlight.value}
                  </div>
                </div>
              ) : null}

              {model.resultSplit ? (
                <div
                  style={{
                    display: "flex",
                    color: COLORS.muted,
                    fontSize: 20,
                    fontWeight: 600,
                  }}
                >
                  H/D/A {model.resultSplit}
                </div>
              ) : null}
            </div>

            <div
              style={{
                display: "flex",
                color: COLORS.muted,
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {(model.features || []).join(" · ")}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "20px 52px",
            backgroundColor: COLORS.orange,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 10,
                height: 40,
                borderRadius: 2,
                backgroundColor: COLORS.green,
              }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <div
                style={{
                  display: "flex",
                  color: COLORS.textDark,
                  fontSize: 26,
                  fontWeight: 800,
                }}
              >
                {SITE_NAME}
              </div>
              <div
                style={{
                  display: "flex",
                  color: COLORS.textDark,
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                soccerstatshub.com
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              color: COLORS.textDark,
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            BTTS · Goals · Rankings · Fixtures
          </div>
        </div>
      </div>
    ),
    {
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      headers: {
        "Cache-Control": CACHE_CONTROL,
      },
    }
  );
}

export default async function handler(req) {
  // X/Twitterbot (and some other crawlers) probe image URLs with HEAD
  // before GET. Rejecting HEAD with 405 can leave shares as a bare link.
  if (req.method === "HEAD") {
    return new Response(null, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": CACHE_CONTROL,
      },
    });
  }

  if (req.method && req.method !== "GET") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { Allow: "GET, HEAD" },
    });
  }

  const param = parseParam(req);
  const resolved = resolveCompetitionOgParam(param);

  if (!resolved) {
    return renderCard(
      buildCompetitionOgCardModel(null, { name: SITE_NAME }),
      null
    );
  }

  const data = await fetchCompetitionData(resolved.seasonId);
  const model = buildCompetitionOgCardModel(data, resolved.catalog);
  const logoSrc = await loadImageDataUrl(model.logoUrl);

  return renderCard(model, logoSrc);
}
