import { render } from "@testing-library/react";
import renderInlineMarkup from "./renderInlineMarkup";

describe("renderInlineMarkup", () => {
  it("renders markdown links", () => {
    const { container } = render(
      <p>
        {renderInlineMarkup(
          "See our [league comparison table](/competitions/compare/) for more."
        )}
      </p>
    );
    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("/competitions/compare/");
    expect(link?.textContent).toBe("league comparison table");
  });

  it("still renders italics", () => {
    const { container } = render(<p>{renderInlineMarkup("A *highlighted* word")}</p>);
    expect(container.querySelector("em")?.textContent).toBe("highlighted");
  });
});
