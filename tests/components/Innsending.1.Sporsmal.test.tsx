import { afterEach, describe, test, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { Innsendingstype } from "~/models/innsendingstype";
import { opprettTestMeldekort, TEST_INFOMELDING } from "../mocks/data";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import * as React from "react";
import type { IMeldekort } from "~/models/meldekort";
import Sporsmal from "~/components/innsending/1-Sporsmal";
import { opprettSporsmal } from "~/utils/miscUtils";
import { Ytelsestype } from "~/models/ytelsestype";
import * as reactI18next from "react-i18next";


describe("Sporsmal", () => {
  afterEach(() => {
    cleanup();
  });

  test("Skal vise innhold for Korrigering og Avbryt skal fungere", async () => {
    const valgtMeldekort = opprettTestMeldekort(1707696000);

    createRouteAndRender(valgtMeldekort, Innsendingstype.KORRIGERING);

    await waitFor(() => screen.findByText("sporsmal.lesVeiledning"));
    await waitFor(() => screen.findByText("sporsmal.ansvarForRiktigUtfylling"));
    await waitFor(() => screen.findByText("korrigering.sporsmal.begrunnelse"));

    // Klikk Neste
    const avbryt = screen.getByText("naviger.avbryt");
    avbryt.click();

    // Sjekk at vi viser AVBRUTT
    await waitFor(() => screen.findByText("AVBRUTT"));
  });

  test("Skal vise innhold for Etterregistrering", async () => {
    const valgtMeldekort = opprettTestMeldekort(1707696000);

    createRouteAndRender(valgtMeldekort, Innsendingstype.ETTERREGISTRERING, Ytelsestype.AAP);

    await waitFor(() => screen.findByText("etterregistrering.sporsmal.omVedtak"));
  });

  test("Skal vise riktig infomelding", async () => {
    const valgtMeldekort = opprettTestMeldekort(1707696000);

    createRouteAndRender(valgtMeldekort, Innsendingstype.INNSENDING);

    await waitFor(() => screen.findByText("English infomessage"));

    vi.spyOn(reactI18next, "useTranslation").mockReturnValue({
      // @ts-ignore
      t: (args: string[]) => args[1],
      // @ts-ignore
      i18n: {
        language: "nb",
      },
    });

    createRouteAndRender(valgtMeldekort, Innsendingstype.INNSENDING);

    await waitFor(() => screen.findByText("Norsk infomelding"));
  });
});

const createRouteAndRender = (
  valgtMeldekort: IMeldekort,
  innsendingstype: Innsendingstype,
  ytelsestypePostfix: string = "",
) => {
  const testRouter = createMemoryRouter([
    {
      path: "/",
      element: <Sporsmal innsendingstype={innsendingstype}
                         fom={valgtMeldekort.meldeperiode.fra.toISOString()}
                         ytelsestypePostfix={ytelsestypePostfix}
                         begrunnelse={""}
                         setBegrunnelse={() => {
                         }}
                         sporsmal={opprettSporsmal(valgtMeldekort.meldegruppe, null)}
                         setSporsmal={() => {
                         }}
                         activeStep={1}
                         setActiveStep={() => {
                         }}
                         infomelding={TEST_INFOMELDING}
      />,
    },
    {
      path: "/om-meldekort",
      element: <div>AVBRUTT</div>,
    },
  ]);

  render(<RouterProvider router={testRouter} />);
};
