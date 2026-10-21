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
import { buildFixtureHeadToHead } from "../../../../src/logic/fixturePageH2h";
import { buildFixtureShareCard } from "../../../../src/logic/fixtureShareCardData";

export const config = { runtime: "edge" };

const CACHE_CONTROL =
  "public, s-maxage=3600, stale-while-revalidate=86400";

const COLORS = {
  navy: "#020029",
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

function Badge({ src, name, size = 72 }) {
  if (src) {
    return (
      <img
        src={src}
        width={size}
        height={size}
        alt=""
        style={{
          width: size,
          height: size,
          objectFit: "contain",
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "rgba(255,255,255,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: COLORS.textLight,
        fontSize: Math.round(size * 0.34),
        fontWeight: 700,
      }}
    >
      {teamInitials(name)}
    </div>
  );
}

const TONE = {
  home: "#1fb83a",
  draw: "#8a8a8a",
  away: "#ec3a28",
};

function TeamBlock({ name, badgeSrc, align = "center", size = 72 }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center",
        justifyContent: "center",
        width: 340,
        gap: 10,
      }}
    >
      <Badge src={badgeSrc} name={name} size={size} />
      <div
        style={{
          display: "flex",
          color: COLORS.textLight,
          fontSize: 28,
          fontWeight: 700,
          lineHeight: 1.15,
          textAlign: align,
          maxWidth: 320,
        }}
      >
        {name}
      </div>
    </div>
  );
}

function OgSplit({ segments }) {
  const total = segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0) || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: 14,
          borderRadius: 7,
          overflow: "hidden",
          backgroundColor: "rgba(255,255,255,0.12)",
        }}
      >
        {segments
          .filter((segment) => segment.value > 0)
          .map((segment) => (
          <div
            key={segment.label}
            style={{
              display: "flex",
              width: `${(Math.max(0, segment.value) / total) * 100}%`,
              height: 14,
              backgroundColor: TONE[segment.tone] || TONE.draw,
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        {segments.map((segment) => (
          <div
            key={`${segment.label}-label`}
            style={{
              display: "flex",
              flexDirection: "column",
              color: COLORS.textLight,
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            <div style={{ display: "flex" }}>{segment.value.toFixed(1)}%</div>
            <div style={{ display: "flex", color: COLORS.muted, fontSize: 14, fontWeight: 600 }}>
              {segment.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        flex: 1,
        minWidth: 460,
        padding: "12px 14px",
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          color: COLORS.orange,
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 0.4,
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function renderCard({ card, homeBadge, awayBadge }) {
  const panels = [];
  if (card.model) {
    panels.push(
      <Panel key="model" title="Model">
        <OgSplit
          segments={[
            { label: card.homeName, value: card.model.homeWin, tone: "home" },
            { label: "Draw", value: card.model.draw, tone: "draw" },
            { label: card.awayName, value: card.model.awayWin, tone: "away" },
          ]}
        />
      </Panel>
    );
  }
  if (card.strengths) {
    panels.push(
      <Panel key="strength" title="Strength">
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
          {[
            ["Attack", card.strengths.homeAttackShare, card.strengths.awayAttackShare],
            ["Defence", card.strengths.homeDefenceShare, card.strengths.awayDefenceShare],
          ].map(([label, homeShare, awayShare]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
              <div style={{ display: "flex", width: 72, color: COLORS.muted, fontSize: 14 }}>{label}</div>
              <div style={{ display: "flex", flex: 1, height: 10, borderRadius: 5, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", width: `${homeShare}%`, height: 10, backgroundColor: TONE.home }} />
                <div style={{ display: "flex", width: `${awayShare}%`, height: 10, backgroundColor: TONE.away }} />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    );
  }
  if (card.markets?.length) {
    panels.push(
      <Panel key="markets" title="Recent markets">
        <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
          {card.markets.map((row) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", width: "100%", color: COLORS.textLight, fontSize: 18, fontWeight: 700 }}>
              <div style={{ display: "flex" }}>{row.homeValue}</div>
              <div style={{ display: "flex", color: COLORS.muted, fontSize: 14 }}>{row.label}</div>
              <div style={{ display: "flex" }}>{row.awayValue}</div>
            </div>
          ))}
        </div>
      </Panel>
    );
  }
  if (card.headToHead) {
    panels.push(
      <Panel key="h2h" title="Head to head">
        <OgSplit
          segments={[
            { label: card.homeName, value: card.headToHead.home, tone: "home" },
            { label: "Draws", value: card.headToHead.draw, tone: "draw" },
            { label: card.awayName, value: card.headToHead.away, tone: "away" },
          ]}
        />
      </Panel>
    );
  }

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
            padding: "28px 40px 16px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", color: COLORS.orange, fontSize: 22, fontWeight: 700 }}>
              {card.league || "Football match"}
            </div>
            {card.kickOff ? (
              <div style={{ display: "flex", color: COLORS.muted, fontSize: 20, fontWeight: 600 }}>
                {card.kickOff}
              </div>
            ) : null}
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: panels.length ? 16 : 0,
            }}
          >
            <TeamBlock name={card.homeName} badgeSrc={homeBadge} align="left" size={panels.length > 1 ? 72 : 108} />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 120,
              }}
            >
              {card.predictedScore ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ display: "flex", color: COLORS.textLight, fontSize: 42, fontWeight: 800 }}>
                    {`${card.predictedScore.home}-${card.predictedScore.away}`}
                  </div>
                  <div style={{ display: "flex", color: COLORS.muted, fontSize: 14, fontWeight: 600 }}>
                    Predicted score
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: "rgba(254,140,0,0.16)",
                    color: COLORS.orange,
                    fontSize: 22,
                    fontWeight: 800,
                  }}
                >
                  v
                </div>
              )}
            </div>
            <TeamBlock name={card.awayName} badgeSrc={awayBadge} align="right" size={panels.length > 1 ? 72 : 108} />
          </div>

          {panels.length ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, width: "100%" }}>{panels}</div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "16px 40px",
            backgroundColor: COLORS.orange,
          }}
        >
          <div
            style={{
              width: 8,
              height: 34,
              borderRadius: 2,
              backgroundColor: COLORS.green,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", color: COLORS.textDark, fontSize: 22, fontWeight: 800 }}>
              {SITE_NAME}
            </div>
            <div style={{ display: "flex", color: COLORS.textDark, fontSize: 16, fontWeight: 600 }}>
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
      card: buildFixtureShareCard({
        homeName: "Home",
        awayName: "Away",
        league: SITE_NAME,
      }),
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
  const card = buildFixtureShareCard({
    homeName: home,
    awayName: away,
    league,
    kickOff,
    headToHead: snapshot ? buildFixtureHeadToHead(snapshot) : null,
  });

  const [homeBadge, awayBadge] = await Promise.all([
    loadBadgeDataUrl(
      buildTeamImageUrl(snapshot?.home_image || snapshot?.homeBadge)
    ),
    loadBadgeDataUrl(
      buildTeamImageUrl(snapshot?.away_image || snapshot?.awayBadge)
    ),
  ]);

  return renderCard({
    card,
    homeBadge,
    awayBadge,
  });
}
