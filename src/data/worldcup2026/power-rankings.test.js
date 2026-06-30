import rankingsData from "./power-rankings.json";
import previewData from "./tournament-preview.json";

const EM_DASH = "\u2014";

const managerByTeam = Object.fromEntries(
  previewData.teamPreviews.map((team) => [team.team, team.manager])
);

const groupByTeam = {};
previewData.groups.forEach((group) => {
  group.teams.forEach((team) => {
    groupByTeam[team] = group.group;
  });
});

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function managerAttributionPattern(manager) {
  return new RegExp(
    `${escapeRegex(manager)}(?:'s side|'s squad| must| has| will)`
  );
}

describe("World Cup 2026 power rankings data", () => {
  test("has required top-level fields", () => {
    expect(rankingsData.updatedAt).toBeTruthy();
    expect(rankingsData.methodology).toBeTruthy();
    expect(rankingsData.rankings.length).toBeGreaterThan(0);
  });

  test("each ranking has required fields", () => {
    rankingsData.rankings.forEach((entry) => {
      expect(entry.rank).toBeGreaterThan(0);
      expect(entry.team).toBeTruthy();
      expect(entry.flag).toBeTruthy();
      expect(entry.record).toBeTruthy();
      expect(entry.winChance).toMatch(/^\d+(\.\d+)?%$/);
      expect(entry.summary).toBeTruthy();
    });
  });

  test("ranks are sequential from 1", () => {
    rankingsData.rankings.forEach((entry, index) => {
      expect(entry.rank).toBe(index + 1);
    });
  });

  test("content contains no em-dashes", () => {
    const allText = [
      rankingsData.methodology,
      ...rankingsData.rankings.flatMap((r) => [
        r.team,
        r.record,
        r.summary,
      ]),
    ].join(" ");
    expect(allText).not.toContain(EM_DASH);
  });

  test("group letters in records match tournament-preview groups", () => {
    rankingsData.rankings.forEach((entry) => {
      const match = entry.record.match(/Group ([A-L])/);
      if (!match || !groupByTeam[entry.team]) return;

      expect(match[1]).toBe(groupByTeam[entry.team]);
    });
  });

  test("summaries do not attribute another team's manager", () => {
    rankingsData.rankings.forEach((entry) => {
      previewData.teamPreviews.forEach((preview) => {
        if (preview.team === entry.team) return;

        expect(entry.summary).not.toMatch(
          managerAttributionPattern(preview.manager)
        );
      });
    });
  });

  test("summaries reference the correct manager when one is named", () => {
    rankingsData.rankings.forEach((entry) => {
      const expectedManager = managerByTeam[entry.team];
      if (!expectedManager) return;

      const mentionedManagers = previewData.teamPreviews
        .map((preview) => preview.manager)
        .filter((manager) => entry.summary.match(managerAttributionPattern(manager)));

      if (mentionedManagers.length === 0) return;

      expect(mentionedManagers).toEqual([expectedManager]);
    });
  });
});
