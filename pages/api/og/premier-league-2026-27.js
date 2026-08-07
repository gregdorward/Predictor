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
  green: "#28a04c",
  textDark: "#020029",
  textLight: "#ffffff",
  muted: "rgba(255,255,255,0.74)",
  chip: "rgba(255,255,255,0.1)",
};

function HookRow({ text }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "14px 20px",
        borderRadius: 14,
        backgroundColor: COLORS.chip,
        maxWidth: 980,
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: COLORS.orange,
          flexShrink: 0,
        }}
      />
      <div
        style={{
          display: "flex",
          color: COLORS.textLight,
          fontSize: 28,
          fontWeight: 600,
        }}
      >
        {text}
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
            justifyContent: "space-between",
            padding: "48px 56px 36px",
            backgroundImage: `linear-gradient(155deg, ${COLORS.navy} 0%, ${COLORS.navySoft} 48%, #12085a 100%)`,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
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
                  width: 14,
                  height: 14,
                  borderRadius: 4,
                  backgroundColor: COLORS.green,
                }}
              />
              <div
                style={{
                  display: "flex",
                  color: COLORS.orange,
                  fontSize: 26,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                }}
              >
                Season Preview
              </div>
            </div>

            <div
              style={{
                display: "flex",
                color: COLORS.textLight,
                fontSize: 74,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: -1.5,
                maxWidth: 980,
              }}
            >
              Premier League 2026/27
            </div>

            <div
              style={{
                display: "flex",
                color: COLORS.muted,
                fontSize: 30,
                fontWeight: 600,
                lineHeight: 1.3,
                maxWidth: 920,
              }}
            >
              Who wins the most open title race in years?
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              marginTop: 28,
            }}
          >
            <HookRow text="9 new managers — a Premier League record" />
            <HookRow text="Arsenal 6/4 favourites to retain" />
            <HookRow text="Full predicted table + 20 club guides" />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "22px 56px",
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
                height: 42,
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
                  fontSize: 28,
                  fontWeight: 800,
                }}
              >
                {SITE_NAME}
              </div>
              <div
                style={{
                  display: "flex",
                  color: COLORS.textDark,
                  fontSize: 20,
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
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            Odds · Transfers · Club guides
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
