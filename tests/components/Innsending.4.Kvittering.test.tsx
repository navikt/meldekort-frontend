import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, test, vi } from "vitest";

import Kvittering from "~/components/innsending/4-Kvittering";
import { Innsendingstype } from "~/models/innsendingstype";
import { Meldegruppe } from "~/models/meldegruppe";
import type { ISporsmal } from "~/models/sporsmal";
import { Ytelsestype } from "~/models/ytelsestype";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/datoUtils";

import { TEST_PERSON_INFO, TEST_SPORSMAL } from "../mocks/data";

const replaceMock = vi.fn();
const trackMock = vi.hoisted(() => vi.fn());

vi.mock("@navikt/nav-dekoratoren-moduler", async () => {
  const actualModule = await import("@navikt/nav-dekoratoren-moduler");
  return {
    ...actualModule,
    getAnalyticsInstance: vi.fn(() => trackMock),
  };
});

const personInfo = TEST_PERSON_INFO;
const fom = "2024-02-12";
const tom = "2024-02-25";

describe("Kvittering", () => {
  Object.defineProperty(window, "location", {
    writable: true,
    value: { assign: vi.fn() },
  });

  Object.defineProperty(window.location, "replace", {
    writable: true,
    value: replaceMock,
  });

  afterEach(() => {
    cleanup();
    trackMock.mockClear();
  });

  /*
  * Innsending
  */
  test("Skal vise innhold for Innsending uten neste meldekort, Umami og kunne skrive ut", async () => {
    createRouteAndRender(Innsendingstype.INNSENDING);

    await vi.waitFor(() => {
      expect(trackMock).toHaveBeenCalledWith("Viser Kvittering", {
        appNavn: "meldekort-frontend",
        arbeidssoker: "ja",
        meldegruppe: Meldegruppe.DAGP,
        innsendingstype: Innsendingstype.INNSENDING,
      });
    });

    await waitFor(() => screen.findAllByText("overskrift.meldekort.sendt")); // overskrift.meldekort.sendt x 2
    await waitFor(() => screen.findByText("sendt.klagerettigheterInfo"));
    await waitFor(() => screen.findByText(`meldekort.for ${personInfo.fornavn} ${personInfo.etternavn} (${personInfo.fodselsnr})`));
    await waitFor(() => screen.findByText(`meldekort.for.perioden overskrift.uke ${formaterPeriodeTilUkenummer(fom, tom)} (${formaterPeriodeDato(fom, tom)})`));
    await waitFor(() => screen.findByText("sendt.mottatt.label"));
    await waitFor(() => screen.findByText("tilbake.minSide"));

    // Sjekker "Skriv ut" knappen
    const spyPrint = vi.spyOn(window, "print");
    const button = await waitFor(() => screen.findByText("overskrift.skrivUt"));
    button.click();
    expect(spyPrint).toHaveBeenCalled();
  });

  test("Skal vise innhold for Innsending med neste meldekort", async () => {
    createRouteAndRender(Innsendingstype.INNSENDING, 1);

    const button = await waitFor(() => screen.findByText("overskrift.nesteMeldekort"));
    button.click();
    expect(replaceMock).toHaveBeenCalledWith("undefined/send-meldekort/1"); // BASE_PATH/send-meldekort/1
    replaceMock.mockClear();
  });

  test("Skal vise innhold for Innsending med neste etterregistrerte meldekort", async () => {
    createRouteAndRender(Innsendingstype.INNSENDING, undefined, 2);

    const button = await waitFor(() => screen.findByText("overskrift.etterregistrertMeldekort"));
    button.click();
    expect(replaceMock).toHaveBeenCalledWith("undefined/etterregistrer-meldekort/2"); // BASE_PATH/etterregistrer-meldekort/w
    replaceMock.mockClear();
  });

  test("Skal vise innhold for Innsending med 2 typer neste meldekort", async () => {
    createRouteAndRender(Innsendingstype.INNSENDING, 1, 2);

    await waitFor(() => screen.findByText("overskrift.nesteMeldekort"));
  });

  /*
   * Etterregistrering
   */
  test("Skal vise innhold for Etterregistrering uten neste meldekort", async () => {
    createRouteAndRender(Innsendingstype.ETTERREGISTRERING, undefined, undefined, undefined, Ytelsestype.TILTAKSPENGER);

    await waitFor(() => screen.findByText("tilbake.minSide"));
  });

  test("Skal vise innhold for Etterregistrering med neste meldekort", async () => {
    createRouteAndRender(Innsendingstype.ETTERREGISTRERING, 1);

    await waitFor(() => screen.findByText("overskrift.nesteMeldekort"));
  });

  test("Skal vise innhold for Etterregistrering med neste etterregistrerte meldekort", async () => {
    createRouteAndRender(Innsendingstype.ETTERREGISTRERING, undefined, 2);

    await waitFor(() => screen.findByText("overskrift.etterregistrertMeldekort"));
  });

  test("Skal vise innhold for Etterregistrering med 2 typer neste meldekort", async () => {
    createRouteAndRender(Innsendingstype.ETTERREGISTRERING, 1, 2);

    await waitFor(() => screen.findByText("overskrift.etterregistrertMeldekort"));
  });

  /*
   * Korrigering
   */
  test("Skal vise innhold for korrigering og med nesteMeldekortKanSendes med Sp.5 = false", async () => {
    const sporsmal = { ...TEST_SPORSMAL, arbeidssoker: false };

    createRouteAndRender(Innsendingstype.KORRIGERING, 1, 2, "2024-02-26", Ytelsestype.DAGPENGER, sporsmal);

    await vi.waitFor(() => {
      expect(trackMock).toHaveBeenCalledWith("Viser Kvittering", {
        appNavn: "meldekort-frontend",
        arbeidssoker: "nei",
        meldegruppe: Meldegruppe.DAGP,
        innsendingstype: Innsendingstype.KORRIGERING,
      });
    });

    await waitFor(() => screen.findByText("sendt.meldekortKanSendes"));
    await waitFor(() => screen.findByText("korrigering.sporsmal.begrunnelse"));
  });
});

const createRouteAndRender = (
  innsendingstype: Innsendingstype,
  nesteMeldekortId: number | undefined = undefined,
  nesteEtterregistrerteMeldekortId: number | undefined = undefined,
  nesteMeldekortKanSendes: string | undefined = undefined,
  ytelsestypePostfix: Ytelsestype | undefined = Ytelsestype.AAP,
  sporsmal: ISporsmal = TEST_SPORSMAL,
) => {
  const testRouter = createMemoryRouter([
    {
      path: "/",
      element: <Kvittering innsendingstype={innsendingstype}
                           ytelsestypePostfix={ytelsestypePostfix}
                           meldegruppe={Meldegruppe.DAGP}
                           personInfo={personInfo}
                           fom={fom}
                           tom={tom}
                           begrunnelse={""}
                           sporsmal={sporsmal}
                           nesteMeldekortId={nesteMeldekortId}
                           nesteEtterregistrerteMeldekortId={nesteEtterregistrerteMeldekortId}
                           nesteMeldekortKanSendes={nesteMeldekortKanSendes}
      />,
    },
  ]);

  render(<RouterProvider router={testRouter} />);
};
