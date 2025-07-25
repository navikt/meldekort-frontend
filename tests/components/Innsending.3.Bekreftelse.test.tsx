import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, test } from "vitest";

import Bekreftelse from "~/components/innsending/3-Bekreftelse";
import { Innsendingstype } from "~/models/innsendingstype";
import type { IMeldekort } from "~/models/meldekort";

import { jsonify, opprettTestMeldekort, TEST_SPORSMAL } from "../mocks/data";


describe("Bekreftelse", () => {
  afterEach(() => {
    cleanup();
  });

  test("Skal vise innhold for Korrigering og Avbryt skal fungere", async () => {
    const valgtMeldekort = opprettTestMeldekort(1707696000);
    jsonify(valgtMeldekort);

    createRouteAndRender((valgtMeldekort as unknown) as IMeldekort, Innsendingstype.KORRIGERING);

    await waitFor(() => screen.findByText("overskrift.steg3.info.ikkeSendt"));
    await waitFor(() => screen.findByText("overskrift.steg3.info.bekreftVerdier"));
    await waitFor(() => screen.findByText("korrigering.sporsmal.begrunnelse"));

    // Klikk Neste
    const avbryt = screen.getByText("naviger.avbryt");
    avbryt.click();

    // Sjekk at vi viser AVBRUTT
    await waitFor(() => screen.findByText("AVBRUTT"));
  });
});

const createRouteAndRender = (
  valgtMeldekort: IMeldekort,
  innsendingstype: Innsendingstype,
  nesteMeldekortKanSendes: string | undefined = undefined,
) => {
  const testRouter = createMemoryRouter([
    {
      path: "/",
      element: <Bekreftelse begrunnelse={""}
                            sporsmal={TEST_SPORSMAL}
                            valgtMeldekort={valgtMeldekort}
                            innsendingstype={innsendingstype}
                            activeStep={3}
                            setActiveStep={() => {
                            }}
                            nesteMeldekortKanSendes={nesteMeldekortKanSendes}
      />,
    },
    {
      path: "/om-meldekort",
      element: <div>AVBRUTT</div>,
    },
  ]);

  render(<RouterProvider router={testRouter} />);
};
