import type { ServerRuntimeMetaArgs } from "@remix-run/server-runtime/dist/routeModules";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, test } from "vitest";

import OmMeldekort, { meta } from "~/routes/om-meldekort";


describe("Om mmldekort", () => {
  test("Skal vise informasjon", async () => {
    const testRouter = createMemoryRouter([
      {
        path: "/",
        element: <OmMeldekort />,
      },
    ]);

    render(<RouterProvider router={testRouter} />);

    expect(screen.getByText("genereltOmMeldekort.velkommen")).toBeDefined();
    expect(screen.getByText("genereltOmMeldekort.velge")).toBeDefined();
    expect(screen.getByText("genereltOmMeldekort.valg.sende")).toBeDefined();
    expect(screen.getByText("genereltOmMeldekort.valg.tidligere")).toBeDefined();
    expect(screen.getByText("genereltOmMeldekort.om.meldekort")).toBeDefined();
    expect(screen.getByText("genereltOmMeldekort.oss")).toBeDefined();
    expect(screen.getByText("overskrift.genereltOmMeldekort")).toBeDefined();
  });

  test("Skal returnere metainformasjon", async () => {
    const args = {} as ServerRuntimeMetaArgs;

    expect(meta(args)).toStrictEqual([
      { title: "Meldekort" },
      { name: "description", content: "Generelt om meldekort" },
    ]);
  });
});
