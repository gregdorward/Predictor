import cupTreeSnapshot from "../data/worldcup2026/cuptrees-snapshot.json";
import {
  buildBracketLinks,
  isWinnerSlotCode,
  mapRoundDescriptionToPhase,
  parseCupTreeResponse,
} from "./worldCupBracket";

describe("worldCupBracket", () => {
  it("maps round descriptions to phase ids", () => {
    expect(mapRoundDescriptionToPhase("Round of 32")).toBe("round32");
    expect(mapRoundDescriptionToPhase("Round of 16")).toBe("round16");
    expect(mapRoundDescriptionToPhase("Quarter-finals")).toBe("quarter");
    expect(mapRoundDescriptionToPhase("Semi-finals")).toBe("semi");
    expect(mapRoundDescriptionToPhase("Final")).toBe("final");
  });

  it("parses cup tree snapshot into normalized rounds", () => {
    const bracket = parseCupTreeResponse(cupTreeSnapshot);

    expect(bracket.name).toContain("Knockout");
    expect(bracket.rounds).toHaveLength(2);

    const round32 = bracket.rounds[0];
    expect(round32.id).toBe("round32");
    expect(round32.label).toBe("Round of 32");
    expect(round32.matches).toHaveLength(2);
    expect(round32.matches[0].homeTeam).toBe("Brazil");
    expect(round32.matches[0].awayTeam).toBe("Japan");
    expect(round32.matches[1].homeTeam).toBe("USA");
    expect(round32.matches[1].finished).toBe(true);
    expect(round32.matches[1].homeWinner).toBe(true);
  });

  it("resolves W74/W77 winner slots to feeder fixtures", () => {
    expect(isWinnerSlotCode("W74")).toBe(true);

    const bracket = parseCupTreeResponse(cupTreeSnapshot);
    const round16 = bracket.rounds[1];

    expect(round16.id).toBe("round16");
    expect(round16.matches[0].homeTeam).toBe("Winner of Brazil vs Japan");
    expect(round16.matches[0].awayTeam).toBe("USA");
    expect(bracket.links).toEqual([
      { fromBlockId: 74, toBlockId: 201, toSide: "home" },
      { fromBlockId: 77, toBlockId: 201, toSide: "away" },
    ]);
  });

  it("uses block.blockId and participant.sourceBlockId for links", () => {
    const bracket = parseCupTreeResponse({
      cupTrees: [
        {
          name: "Knockout stage",
          rounds: [
            {
              order: 1,
              description: "Round of 32",
              blocks: [
                {
                  id: 2585779,
                  blockId: 2218759,
                  order: 1,
                  participants: [
                    { team: { name: "Germany" } },
                    { team: { name: "Paraguay" } },
                  ],
                },
                {
                  id: 2585780,
                  blockId: 2218761,
                  order: 2,
                  participants: [
                    { team: { name: "France" } },
                    { team: { name: "Sweden" } },
                  ],
                },
              ],
            },
            {
              order: 2,
              description: "Round of 16",
              blocks: [
                {
                  id: 2585778,
                  blockId: 2218791,
                  order: 1,
                  participants: [
                    { team: { name: "W74" }, sourceBlockId: 2218759 },
                    { team: { name: "W77" }, sourceBlockId: 2218761 },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    expect(bracket.rounds[1].matches[0].homeTeam).toBe(
      "Winner of Germany vs Paraguay"
    );
    expect(bracket.rounds[1].matches[0].awayTeam).toBe(
      "Winner of France vs Sweden"
    );
    expect(bracket.links).toEqual([
      { fromBlockId: 2218759, toBlockId: 2218791, toSide: "home" },
      { fromBlockId: 2218761, toBlockId: 2218791, toSide: "away" },
    ]);
  });

  it("builds positional links when explicit feeder ids are absent", () => {
    const rounds = [
      {
        matches: [{ blockId: 1 }, { blockId: 2 }],
      },
      {
        matches: [{ blockId: 10 }],
      },
    ];

    expect(buildBracketLinks(rounds)).toEqual([
      { fromBlockId: 1, toBlockId: 10, toSide: "home" },
      { fromBlockId: 2, toBlockId: 10, toSide: "away" },
    ]);
  });

  it("returns empty rounds when cup trees are missing", () => {
    expect(parseCupTreeResponse({})).toEqual({
      name: null,
      currentRound: null,
      rounds: [],
      links: [],
    });
  });
});
