import { render, screen } from "@testing-library/react";
import { createMemoryRouter, MetaArgs, RouterProvider } from "react-router";
import { describe, expect, test } from "vitest";

import OfteStilteSporsmal, { meta } from "~/routes/ofte-stilte-sporsmal";


describe("Ofte stilte spørsmål", () => {
  test("Skal vise informasjon", async () => {
    const testRouter = createMemoryRouter([
      {
        path: "/",
        element: <OfteStilteSporsmal />,
      },
    ]);

    render(<RouterProvider router={testRouter} />);

    expect(screen.getByText("oss.sende.overskrift")).toBeDefined();
    expect(screen.getByText("oss.sende.tekst")).toBeDefined();
    expect(screen.getByText("oss.frist.overskrift")).toBeDefined();
    expect(screen.getByText("oss.frist.tekst")).toBeDefined();
    expect(screen.getByText("oss.korrigere.overskrift")).toBeDefined();
    expect(screen.getByText("oss.korrigere.tekst")).toBeDefined();
    expect(screen.getByText("oss.pengene.overskrift")).toBeDefined();
    expect(screen.getByText("oss.pengene.tekst")).toBeDefined();
    expect(screen.getByText("oss.utbetalt.overskrift")).toBeDefined();
    expect(screen.getByText("oss.utbetalt.tekst")).toBeDefined();
    expect(screen.getByText("overskrift.ofteStilteSporsmal")).toBeDefined();
  });

  test("Skal returnere metainformasjon", async () => {
    const args = {} as MetaArgs;

    expect(meta(args)).toStrictEqual([
      { title: "Meldekort" },
      { name: "description", content: "Ofte stilte spørsmål" },
    ]);
  });
});
