import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, MetaArgs, RouterProvider } from "react-router";
import { describe, expect, test } from "vitest";

import IkkeTilgang, { meta } from "~/routes/ikke-tilgang";


describe("Ikke tilgang", () => {
  test("Skal vise informasjon", async () => {
    const testRouter = createMemoryRouter([
      {
        path: "/",
        element: <IkkeTilgang />,
      },
    ]);

    render(<RouterProvider router={testRouter} />);

    await waitFor(() => screen.findByText("ikke.tilgang.overskrift"));
    await waitFor(() => screen.findByText("ikke.tilgang.tekst"));
  });

  test("Skal returnere metainformasjon", async () => {
    const args = {} as MetaArgs;

    expect(meta(args)).toStrictEqual([
      { title: "Meldekort" },
      { name: "description", content: "Du har ikke tilgang" },
    ]);
  });
});
