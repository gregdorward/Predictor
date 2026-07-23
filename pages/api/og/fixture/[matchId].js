import { ImageResponse } from "next/og";
import { resolveFixtureLeagueName } from "../../../../src/seo/competitionCatalog";
import {
  buildTeamImageUrl,
  parseFixtureParam,
} from "../../../../src/seo/fixtureSlug";
import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SITE_NAME,
} from "../../../../src/seo/pageMetaConfig";
import { fetchMatchSnapshot } from "../../../../src/seo/serverFetch";

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
};

function parseMatchId(req) {
  try {
    const { pathname } = new URL(req.url);
    const parts = pathname.split("/").filter(Boolean);
    const param = parts[parts.length - 1];
    const parsed = parseFixtureParam(param);
    return parsed?.matchId || null;
  } catch {
    return null;
  }
}

function formatKickOff(dateUnix) {
  if (!dateUnix) return null;
  const date = new Date(Number(dateUnix) * 1000);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  });
}

function teamInitials(name) {
  const parts = String(name || "T")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "T";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
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

async function loadBadgeDataUrl(imageUrl) {
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

function Badge({ src, name }) {
  if (src) {
    return (
      <img
        src={src}
        width={120}
        height={120}
        alt=""
        style={{
          width: 120,
          height: 120,
          objectFit: "contain",
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "rgba(255,255,255,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: COLORS.textLight,
        fontSize: 40,
        fontWeight: 700,
      }}
    >
      {teamInitials(name)}
    </div>
  );
}

function TeamBlock({ name, badgeSrc, align = "center" }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center",
        justifyContent: "center",
        width: 420,
        gap: 20,
      }}
    >
      <Badge src={badgeSrc} name={name} />
      <div
        style={{
          display: "flex",
          color: COLORS.textLight,
          fontSize: 42,
          fontWeight: 700,
          lineHeight: 1.15,
          textAlign: align,
          maxWidth: 400,
        }}
      >
        {name}
      </div>
    </div>
  );
}

function renderCard({
  home,
  away,
  league,
  kickOff,
  homeBadge,
  awayBadge,
}) {
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
            padding: "48px 56px 28px",
            backgroundImage: `linear-gradient(160deg, ${COLORS.navy} 0%, ${COLORS.navySoft} 55%, #0a0640 100%)`,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginBottom: 36,
            }}
          >
            <div
              style={{
                display: "flex",
                color: COLORS.orange,
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              {league || "Football match"}
            </div>
            {kickOff ? (
              <div
                style={{
                  display: "flex",
                  color: COLORS.muted,
                  fontSize: 24,
                  fontWeight: 500,
                }}
              >
                {kickOff}
              </div>
            ) : null}
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            <TeamBlock name={home} badgeSrc={homeBadge} align="left" />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: "rgba(254,140,0,0.16)",
                color: COLORS.orange,
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: 1,
              }}
            >
              VS
            </div>
            <TeamBlock name={away} badgeSrc={awayBadge} align="right" />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "22px 56px",
            backgroundColor: COLORS.orange,
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

  const matchId = parseMatchId(req);
  if (!matchId) {
    return renderCard({
      home: "Home",
      away: "Away",
      league: SITE_NAME,
      kickOff: null,
      homeBadge: null,
      awayBadge: null,
    });
  }

  const snapshot = await fetchMatchSnapshot(matchId);
  const home = snapshot?.home_name || snapshot?.homeTeam || "Home";
  const away = snapshot?.away_name || snapshot?.awayTeam || "Away";
  const league = snapshot
    ? resolveFixtureLeagueName(snapshot) ||
      snapshot.competition_name ||
      snapshot.league_name ||
      null
    : SITE_NAME;
  const kickOff = snapshot
    ? formatKickOff(snapshot.date_unix ?? snapshot.date)
    : null;

  const [homeBadge, awayBadge] = await Promise.all([
    loadBadgeDataUrl(
      buildTeamImageUrl(snapshot?.home_image || snapshot?.homeBadge)
    ),
    loadBadgeDataUrl(
      buildTeamImageUrl(snapshot?.away_image || snapshot?.awayBadge)
    ),
  ]);

  return renderCard({
    home,
    away,
    league,
    kickOff,
    homeBadge,
    awayBadge,
  });
}
