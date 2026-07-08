import { MATCH_PHASE_LABELS } from "./worldCup2026Matches";

const ROUND_DESCRIPTION_TO_PHASE = {
  "round of 32": "round32",
  "1/16": "round32",
  "round of 16": "round16",
  "1/8": "round16",
  "quarter-finals": "quarter",
  "quarter-finals ": "quarter",
  "quarterfinals": "quarter",
  "1/4": "quarter",
  "semi-finals": "semi",
  semifinals: "semi",
  "1/2": "semi",
  final: "final",
  "3rd place": "final",
  "third place": "final",
};

const WINNER_SLOT_PATTERN = /^W(\d+)$/i;

function normalizeDescription(description) {
  return String(description || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function mapRoundDescriptionToPhase(description) {
  const normalized = normalizeDescription(description);
  if (ROUND_DESCRIPTION_TO_PHASE[normalized]) {
    return ROUND_DESCRIPTION_TO_PHASE[normalized];
  }

  if (normalized.includes("round of 32") || normalized.includes("1/16")) {
    return "round32";
  }
  if (normalized.includes("round of 16") || normalized.includes("1/8")) {
    return "round16";
  }
  if (normalized.includes("quarter")) {
    return "quarter";
  }
  if (normalized.includes("semi")) {
    return "semi";
  }
  if (normalized.includes("final") || normalized.includes("3rd place")) {
    return "final";
  }

  return null;
}

export function isWinnerSlotCode(name) {
  return WINNER_SLOT_PATTERN.test(String(name || "").trim());
}

function winnerSlotBlockId(name) {
  const match = WINNER_SLOT_PATTERN.exec(String(name || "").trim());
  return match ? Number(match[1]) : null;
}

function teamNameFromParticipant(participant) {
  return (
    participant?.team?.name ||
    participant?.team?.shortName ||
    participant?.name ||
    null
  );
}

function sourceBlockIdFromParticipant(participant) {
  const explicit =
    participant?.sourceBlockId ??
    participant?.sourceBlock?.id ??
    participant?.blockId ??
    null;

  if (explicit != null) {
    return Number(explicit);
  }

  const name = teamNameFromParticipant(participant);
  return winnerSlotBlockId(name);
}

function teamsFromEmbeddedEvent(block) {
  const event = block?.events?.[0];
  if (!event || typeof event !== "object") {
    return null;
  }

  const home = event.homeTeam?.name || event.homeTeam?.shortName || null;
  const away = event.awayTeam?.name || event.awayTeam?.shortName || null;

  if (!home && !away) {
    return null;
  }

  return { home, away };
}

function rawTeamsFromBlock(block) {
  const embedded = teamsFromEmbeddedEvent(block);
  const participants = Array.isArray(block?.participants) ? block.participants : [];

  const homeTeam =
    block?.homeTeam?.name ||
    block?.homeTeam?.shortName ||
    embedded?.home ||
    teamNameFromParticipant(participants[0]);
  const awayTeam =
    block?.awayTeam?.name ||
    block?.awayTeam?.shortName ||
    embedded?.away ||
    teamNameFromParticipant(participants[1]);

  return { homeTeam, awayTeam, participants };
}

function winnerFromBlock(block, homeTeam, awayTeam, participants) {
  if (participants[0]?.winner === true) {
    return homeTeam;
  }
  if (participants[1]?.winner === true) {
    return awayTeam;
  }

  const homeScore =
    block?.homeTeamScore ?? block?.homeScore?.display ?? block?.homeScore ?? null;
  const awayScore =
    block?.awayTeamScore ?? block?.awayScore?.display ?? block?.awayScore ?? null;

  if (homeScore == null || awayScore === "" || awayScore == null || homeScore === "") {
    return null;
  }

  const home = Number(homeScore);
  const away = Number(awayScore);

  if (Number.isNaN(home) || Number.isNaN(away) || home === away) {
    return null;
  }

  return home > away ? homeTeam : awayTeam;
}

function canonicalBlockId(block) {
  const id = block?.blockId ?? block?.id;
  return id == null ? null : Number(id);
}

function indexBlockEntry(blockById, key, entry) {
  if (key == null || Number.isNaN(key)) {
    return;
  }
  blockById.set(Number(key), entry);
}

function buildBlockIndex(tree) {
  const blockById = new Map();

  for (const round of tree?.rounds || []) {
    const roundLabel =
      (mapRoundDescriptionToPhase(round?.description) &&
        MATCH_PHASE_LABELS[mapRoundDescriptionToPhase(round.description)]) ||
      round?.description ||
      `Round ${round?.order ?? ""}`.trim();

    for (const block of round?.blocks || []) {
      const canonicalId = canonicalBlockId(block);
      if (canonicalId == null) {
        continue;
      }

      const { homeTeam, awayTeam, participants } = rawTeamsFromBlock(block);
      const homeScore =
        block?.homeTeamScore ??
        block?.homeScore?.display ??
        block?.homeScore ??
        null;
      const awayScore =
        block?.awayTeamScore ??
        block?.awayScore?.display ??
        block?.awayScore ??
        null;

      const finished =
        block?.finished === true ||
        (homeScore != null &&
          awayScore != null &&
          homeScore !== "" &&
          awayScore !== "");

      const entry = {
        id: canonicalId,
        roundLabel,
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        finished,
        winnerTeam: winnerFromBlock(block, homeTeam, awayTeam, participants),
        eventId: Array.isArray(block?.events)
          ? typeof block.events[0] === "number"
            ? block.events[0]
            : block.events[0]?.id ?? null
          : null,
      };

      indexBlockEntry(blockById, canonicalId, entry);
      if (block?.id != null && Number(block.id) !== canonicalId) {
        indexBlockEntry(blockById, Number(block.id), entry);
      }
    }
  }

  return blockById;
}

function resolveSlotLabel(rawName, blockById, depth = 0) {
  const name = String(rawName || "").trim();
  if (!name) {
    return null;
  }

  if (!isWinnerSlotCode(name)) {
    return name;
  }

  if (depth > 6) {
    return "TBD";
  }

  const sourceBlockId = winnerSlotBlockId(name);
  const source = blockById.get(sourceBlockId);

  if (!source) {
    return "TBD";
  }

  if (source.finished && source.winnerTeam && !isWinnerSlotCode(source.winnerTeam)) {
    return source.winnerTeam;
  }

  const home = resolveSlotLabel(source.homeTeam, blockById, depth + 1);
  const away = resolveSlotLabel(source.awayTeam, blockById, depth + 1);

  const homeKnown = home && home !== "TBD" && !isWinnerSlotCode(home);
  const awayKnown = away && away !== "TBD" && !isWinnerSlotCode(away);

  if (homeKnown && awayKnown) {
    if (source.finished && source.winnerTeam) {
      return source.winnerTeam;
    }
    return `Winner of ${home} vs ${away}`;
  }

  return `Winner of ${source.roundLabel} fixture`;
}

function feederFixtureLabel(source, blockById) {
  const home = resolveSlotLabel(source.homeTeam, blockById);
  const away = resolveSlotLabel(source.awayTeam, blockById);

  const homeKnown = home && home !== "TBD" && !isWinnerSlotCode(home);
  const awayKnown = away && away !== "TBD" && !isWinnerSlotCode(away);

  if (homeKnown && awayKnown) {
    return { home, away };
  }

  return null;
}

function resolveParticipantLabel(participant, blockById) {
  const rawName = teamNameFromParticipant(participant);
  const sourceId = sourceBlockIdFromParticipant(participant);

  if (sourceId != null && blockById.has(sourceId)) {
    const source = blockById.get(sourceId);
    if (source.finished && source.winnerTeam && !isWinnerSlotCode(source.winnerTeam)) {
      return source.winnerTeam;
    }

    const fixture = feederFixtureLabel(source, blockById);
    if (fixture) {
      return `Winner of ${fixture.home} vs ${fixture.away}`;
    }

    return `Winner of ${source.roundLabel} fixture`;
  }

  return resolveSlotLabel(rawName, blockById);
}

function parseBlockMatch(block, blockById, roundLabel) {
  const participants = Array.isArray(block?.participants)
    ? block.participants
    : [];
  const embedded = teamsFromEmbeddedEvent(block);

  const rawHome =
    block?.homeTeam?.name ||
    block?.homeTeam?.shortName ||
    embedded?.home ||
    teamNameFromParticipant(participants[0]);
  const rawAway =
    block?.awayTeam?.name ||
    block?.awayTeam?.shortName ||
    embedded?.away ||
    teamNameFromParticipant(participants[1]);

  const homeTeam = resolveParticipantLabel(participants[0] || { name: rawHome }, blockById) || "TBD";
  const awayTeam = resolveParticipantLabel(participants[1] || { name: rawAway }, blockById) || "TBD";

  const homeScore =
    block?.homeTeamScore ?? block?.homeScore?.display ?? block?.homeScore ?? null;
  const awayScore =
    block?.awayTeamScore ?? block?.awayScore?.display ?? block?.awayScore ?? null;

  const homeWinner = participants[0]?.winner === true;
  const awayWinner = participants[1]?.winner === true;

  const finished =
    block?.finished === true ||
    (homeScore != null &&
      awayScore != null &&
      homeScore !== "" &&
      awayScore !== "");

  const homeSourceBlockId =
    sourceBlockIdFromParticipant(participants[0]) ?? winnerSlotBlockId(rawHome);
  const awaySourceBlockId =
    sourceBlockIdFromParticipant(participants[1]) ?? winnerSlotBlockId(rawAway);

  const isPlaceholder = homeTeam === "TBD" && awayTeam === "TBD" && !finished;

  return {
    blockId: canonicalBlockId(block),
    homeSourceBlockId: homeSourceBlockId ?? null,
    awaySourceBlockId: awaySourceBlockId ?? null,
    eventId: Array.isArray(block?.events)
      ? typeof block.events[0] === "number"
        ? block.events[0]
        : block.events[0]?.id ?? null
      : null,
    homeTeam,
    awayTeam,
    homeScore: homeScore != null && homeScore !== "" ? String(homeScore) : null,
    awayScore: awayScore != null && awayScore !== "" ? String(awayScore) : null,
    homeWinner,
    awayWinner,
    finished,
    isPlaceholder,
    roundLabel,
  };
}

function parseRound(round, blockById) {
  const phase = mapRoundDescriptionToPhase(round?.description);
  const label =
    (phase && MATCH_PHASE_LABELS[phase]) ||
    round?.description ||
    `Round ${round?.order ?? ""}`.trim();

  const matches = (round?.blocks || [])
    .slice()
    .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
    .map((block) => parseBlockMatch(block, blockById, label))
    .filter(
      (match) =>
        !(match.homeTeam === "TBD" && match.awayTeam === "TBD" && !match.eventId)
    );

  return {
    id: phase || `round-${round?.order ?? "unknown"}`,
    order: round?.order ?? 0,
    label,
    matches,
  };
}

/**
 * Bracket edges from feeder blocks to the home/away slot of the next match.
 * Uses explicit W## / sourceBlockId links when present; otherwise pairs
 * adjacent rounds by block order (matches cup-tree layout).
 */
export function buildBracketLinks(rounds) {
  const links = [];

  for (const round of rounds) {
    for (const match of round.matches) {
      if (match.blockId == null) {
        continue;
      }

      if (match.homeSourceBlockId != null) {
        links.push({
          fromBlockId: match.homeSourceBlockId,
          toBlockId: match.blockId,
          toSide: "home",
        });
      }

      if (match.awaySourceBlockId != null) {
        links.push({
          fromBlockId: match.awaySourceBlockId,
          toBlockId: match.blockId,
          toSide: "away",
        });
      }
    }
  }

  if (links.length > 0) {
    return links;
  }

  for (let roundIndex = 0; roundIndex < rounds.length - 1; roundIndex += 1) {
    const currentRound = rounds[roundIndex];
    const nextRound = rounds[roundIndex + 1];

    currentRound.matches.forEach((match, matchIndex) => {
      const nextMatchIndex = Math.floor(matchIndex / 2);
      const nextMatch = nextRound.matches[nextMatchIndex];

      if (match.blockId == null || nextMatch?.blockId == null) {
        return;
      }

      links.push({
        fromBlockId: match.blockId,
        toBlockId: nextMatch.blockId,
        toSide: matchIndex % 2 === 0 ? "home" : "away",
      });
    });
  }

  return links;
}

/**
 * Normalise industry stat website get-cuptrees response for bracket UI.
 * Resolves W74-style winner slots back to feeder fixtures in earlier rounds.
 */
export function parseCupTreeResponse(raw) {
  const cupTrees = raw?.cupTrees || raw?.data?.cupTrees || [];
  if (!cupTrees.length) {
    return { name: null, currentRound: null, rounds: [], links: [] };
  }

  const tree =
    cupTrees.find((entry) =>
      String(entry?.name || "")
        .toLowerCase()
        .includes("knockout")
    ) || cupTrees[cupTrees.length - 1];

  const blockById = buildBlockIndex(tree);

  const rounds = (tree?.rounds || [])
    .slice()
    .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
    .map((round) => parseRound(round, blockById))
    .filter((round) => round.matches.length > 0);

  const links = buildBracketLinks(rounds);

  return {
    name: tree?.name ?? null,
    currentRound: tree?.currentRound ?? null,
    rounds,
    links,
  };
}
