import { ImageResponse } from "next/og";
import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SITE_NAME,
} from "../../../src/seo/pageMetaConfig";

export const config = { runtime: "edge" };

const CACHE_CONTROL =
  "public, s-maxage=86400, stale-while-revalidate=604800";

const COLORS = {
  navy: "#020029",
  navySoft: "#030040",
  orange: "#fe8c00",
  green: "#0b6b2f",
  greenMid: "#2f9e44",
  amber: "#f0a202",
  red: "#8f1d1d",
  textDark: "#020029",
  textLight: "#ffffff",
  muted: "rgba(255,255,255,0.74)",
  chip: "rgba(255,255,255,0.1)",
};

function ToneRow({ color, label, detail }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "10px 16px",
        borderRadius: 12,
        backgroundColor: COLORS.chip,
        maxWidth: 980,
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            color: COLORS.textLight,
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          {label}
        </div>
        <div
          style={{
            display: "flex",
            color: COLORS.muted,
            fontSize: 18,
            fontWeight: 500,
          }}
        >
          {detail}
        </div>
      </div>
    </div>
  );
}

function renderCard() {
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
            justifyContent: "flex-start",
            gap: 22,
            padding: "36px 56px 24px",
            backgroundImage: `linear-gradient(155deg, ${COLORS.navy} 0%, ${COLORS.navySoft} 48%, #12085a 100%)`,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
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
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: COLORS.greenMid,
                  }}
                />
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: COLORS.amber,
                  }}
                />
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: COLORS.red,
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  color: COLORS.orange,
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                }}
              >
                Market Reliability Index
              </div>
            </div>

            <div
              style={{
                display: "flex",
                color: COLORS.textLight,
                fontSize: 48,
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: -1,
                maxWidth: 1040,
              }}
            >
              Which leagues and teams are the most predictable?
            </div>

            <div
              style={{
                display: "flex",
                color: COLORS.muted,
                fontSize: 23,
                fontWeight: 600,
                lineHeight: 1.25,
                maxWidth: 980,
              }}
            >
              Favourite wins, underdog results and predictability scores -
              updated daily
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginTop: "auto",
            }}
          >
            <ToneRow
              color={COLORS.green}
              label="Excellent"
              detail="Favourites hold up - cleaner 1X2 leagues"
            />
            <ToneRow
              color={COLORS.amber}
              label="Mixed"
              detail="Draws and noise - prices need more caution"
            />
            <ToneRow
              color={COLORS.red}
              label="Unreliable"
              detail="Upsets, underdogs and beaten favourites more often"
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "18px 56px",
            backgroundColor: COLORS.orange,
            flexShrink: 0,
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
                height: 42,
                borderRadius: 2,
                backgroundColor: COLORS.greenMid,
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
            Leagues · Teams · Underdogs
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

  return renderCard();
}
