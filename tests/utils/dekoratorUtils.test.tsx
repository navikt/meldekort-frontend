import { describe, test } from "vitest";
import { useInjectDecoratorScript } from "~/utils/dekoratorUtils";
import { render, screen, waitFor } from "@testing-library/react";


describe("Dekorator utils", () => {
  test("Skal legge til script", async () => {
    const TestComponent = () => {

      useInjectDecoratorScript(
        "" +
        "<div data-testid=\"divElement\">DIV1</div>" +
        "<div>DIV2</div>" +
        "<script data-testid=\"scriptElement\"></script>",
      );

      return (
        <div id="main">TEST</div>
      );
    };

    render(<TestComponent />);

    await waitFor(() => screen.findByText("TEST"));
    await waitFor(() => screen.findByTestId("divElement"));
    // Script-element fra Dekoratøren har selve koden i en fil koblet gjennom src-attributtet
    // Dvs. det er nok å sjekke at vi kopierer attributes til det script-elementet vi oppretter
    await waitFor(() => screen.findByTestId("scriptElement"));
  });
});
