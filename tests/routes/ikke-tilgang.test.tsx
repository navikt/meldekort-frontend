import { describe, expect, test } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import IkkeTilgang, { meta } from "~/routes/meldekort.ikke-tilgang";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import type { ServerRuntimeMetaArgs } from "@remix-run/server-runtime/dist/routeModules";


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
    const args = {} as ServerRuntimeMetaArgs;

    expect(meta(args)).toStrictEqual([
      { title: "Meldekort" },
      { name: "description", content: "Du har ikke tilgang" },
    ]);
  });
});
