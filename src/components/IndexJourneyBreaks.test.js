import { render } from "@testing-library/react";
import CompetitionsIndexMain from "./CompetitionsIndexMain";
import FixturesIndexMain from "./FixturesIndexMain";

function countDirectContentAdSlots(container) {
  return container.querySelectorAll(
    "#ssh-content > .FixturePage-contentBreak--adSlot"
  ).length;
}

describe("index Journey break markers", () => {
  it("adds direct break markers between fixture date groups", () => {
    const fixtures = [
      {
        href: "/fixture/a-vs-b-1/",
        label: "A vs B",
        homeTeam: "A",
        awayTeam: "B",
        league: "League A",
        kickOff: "12:00",
        dateLabel: "Today",
        dateKey: "today",
        sectionId: "fixtures-today",
      },
      {
        href: "/fixture/c-vs-d-2/",
        label: "C vs D",
        homeTeam: "C",
        awayTeam: "D",
        league: "League B",
        kickOff: "13:00",
        dateLabel: "Tomorrow",
        dateKey: "tomorrow",
        sectionId: "fixtures-tomorrow",
      },
      {
        href: "/fixture/e-vs-f-3/",
        label: "E vs F",
        homeTeam: "E",
        awayTeam: "F",
        league: "League C",
        kickOff: "14:00",
        dateLabel: "Wednesday",
        dateKey: "wednesday",
        sectionId: "fixtures-wednesday",
      },
    ];

    const { container } = render(
      <main id="ssh-content">
        <FixturesIndexMain fixtures={fixtures} />
      </main>
    );

    expect(countDirectContentAdSlots(container)).toBe(3);
  });

  it("adds sparse direct break markers between competition groups", () => {
    const makeCompetition = (slug) => ({
      slug,
      name: slug.replace(/-/g, " "),
    });
    const sections = {
      featured: [makeCompetition("premier-league")],
      regions: [
        { id: "england", label: "England", competitions: [makeCompetition("league-one")] },
        { id: "spain", label: "Spain", competitions: [makeCompetition("la-liga")] },
        { id: "italy", label: "Italy", competitions: [makeCompetition("serie-a")] },
        { id: "germany", label: "Germany", competitions: [makeCompetition("bundesliga")] },
      ],
      other: [makeCompetition("mls")],
      total: 6,
    };

    const { container } = render(<CompetitionsIndexMain sections={sections} />);

    expect(countDirectContentAdSlots(container)).toBe(1);
  });
});
