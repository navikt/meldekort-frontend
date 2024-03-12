import { describe, expect, test, vi } from "vitest";
import { getText, parseHtml, useExtendedTranslation } from "~/utils/intlUtils";
import i18next from "i18next";
import { render } from "@testing-library/react";


describe("Intl utils", () => {
  test("useExtendedTranslation skal returnere tt-funksjonen", async () => {
    const TestComponent = () => {
      const { tt } = useExtendedTranslation();

      return (
        <div data-testid="1">pre {tt("nøkkel")} post</div>
      );
    };

    const { getByTestId } = render(<TestComponent />);
    expect(getByTestId("1").textContent).toBe("pre nøkkel post");
  });

  test("getText skal returnere nøkkel hvis tekst ikke finnes", async () => {
    let result = getText("nøkkel");
    expect(result).toBe("nøkkel");
  });

  test("getText skal returnere tekst hvis den finnes", async () => {
    vi.spyOn(i18next, "t").mockReturnValue("verdi");

    const result = getText("nøkkel");
    expect(result).toBe("verdi");
  });

  test("getText skal returnere tekst og sette inn verdier", async () => {
    vi.spyOn(i18next, "t").mockReturnValue("a {verdi1} c {verdi2} e");

    const result = getText("nøkkel", { "verdi1": "b", "verdi2": "d" });
    expect(result).toBe("a b c d e");
  });

  test("parseHtml skal returnere dangerouslySetInnerHTML med HTML", async () => {
    const html = "<div>!</div>";

    const result = parseHtml(html);
    expect(result).toStrictEqual(<span dangerouslySetInnerHTML={{ __html: html }} />);
  });

  test("parseHtml skal returnere dangerouslySetInnerHTML med HTML og sette inn verdier", async () => {
    const html = "<div>a {0} c {1} e</div>";

    const result = parseHtml(html, ["b", "d"]);
    expect(result).toStrictEqual(<span dangerouslySetInnerHTML={{ __html: "<div>a b c d e</div>" }} />);
  });
});
