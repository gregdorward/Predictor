export function normalizePlayerName(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function findPlayerStatsEntry(players, missingPlayer) {
  if (!Array.isArray(players) || !missingPlayer) {
    return null;
  }

  if (missingPlayer.id != null) {
    const byId = players.find(
      (player) => Number(player.id) === Number(missingPlayer.id)
    );
    if (byId) {
      return byId;
    }
  }

  const targetName = normalizePlayerName(missingPlayer.name);
  if (!targetName) {
    return null;
  }

  const exactNameMatch = players.find(
    (player) => normalizePlayerName(player.name) === targetName
  );
  if (exactNameMatch) {
    return exactNameMatch;
  }

  return (
    players.find((player) => {
      const candidate = normalizePlayerName(player.name);
      return candidate.includes(targetName) || targetName.includes(candidate);
    }) ?? null
  );
}
