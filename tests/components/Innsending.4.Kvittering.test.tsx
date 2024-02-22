import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import Kvittering from "~/components/innsending/4-Kvittering";
import { Innsendingstype } from "~/models/innsendingstype";
import { TEST_PERSON_INFO, TEST_SPORSMAL } from "../mocks/data";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/datoUtils";
import { Ytelsestype } from "~/models/ytelsestype";
import * as React from "react";
import { Meldegruppe } from "~/models/meldegruppe";
import amplitude from "@amplitude/analytics-browser";


const personInfo = TEST_PERSON_INFO;
const fom = "2024-02-12";
const tom = "2024-02-25";

describe("Kvittering", () => {
  const hjMock = vi.fn();
  Object.defineProperty(window, "hj", {
    writable: true,
    value: hjMock
  });

  const replaceMock = vi.fn();
  Object.defineProperty(window, "location", {
    writable: true,
    value: { assign: vi.fn() }
  });

  Object.defineProperty(window.location, "replace", {
    writable: true,
    value: replaceMock
  });

  afterEach(() => {
    cleanup();
  });

  /*
  * Innsending
  */
  test("Skal vise innhold for Innsending uten neste meldekort, kalle HJ og Amplitude og kunne skrive ut", async () => {
    const trackSpy = vi.spyOn(amplitude, "track");

    createRouteAndRender(Innsendingstype.INNSENDING);

    expect(hjMock).toBeCalledWith("trigger", "meldekortAAP");
    hjMock.mockClear();

    expect(trackSpy).toBeCalledWith("meldekort.aktivitet", {
      arbeidssoker: "ja",
      meldegruppe: Meldegruppe.DAGP,
      innsendingstype: Innsendingstype.INNSENDING,
      aktivitet: "Viser kvittering"
    });
    expect(trackSpy).toBeCalledWith("meldekort.aktivitet", {
      meldegruppe: Meldegruppe.DAGP,
      aktivitet: "skjema fullført"
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
    expect(spyPrint).toBeCalled();
  });

  test("Skal vise innhold for Innsending med neste meldekort", async () => {
    createRouteAndRender(Innsendingstype.INNSENDING, 1);

    const button = await waitFor(() => screen.findByText("overskrift.nesteMeldekort"));
    button.click();
    expect(replaceMock).toBeCalledWith("/send-meldekort/1");
    replaceMock.mockClear();
  });

  test("Skal vise innhold for Innsending med neste etterregistrerte meldekort", async () => {
    createRouteAndRender(Innsendingstype.INNSENDING, undefined, 2);

    const button = await waitFor(() => screen.findByText("overskrift.etterregistrertMeldekort"));
    button.click();
    expect(replaceMock).toBeCalledWith("/etterregistrering/2");
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

    expect(hjMock).toBeCalledWith("trigger", "meldekortTP");
    hjMock.mockClear();

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
  test("Skal vise innhold for korrigering og med nesteMeldekortKanSendes", async () => {
    createRouteAndRender(Innsendingstype.KORRIGERING, 1, 2, "2024-02-26");

    await waitFor(() => screen.findByText("sendt.meldekortKanSendes"));
    await waitFor(() => screen.findByText("korrigering.sporsmal.begrunnelse"));
  });
});

const createRouteAndRender = (
  innsendingstype: Innsendingstype,
  nesteMeldekortId: Number | undefined = undefined,
  nesteEtterregistrerteMeldekortId: Number | undefined = undefined,
  nesteMeldekortKanSendes: string | undefined = undefined,
  ytelsestypePostfix: Ytelsestype | undefined = Ytelsestype.AAP
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
                           sporsmal={TEST_SPORSMAL}
                           nesteMeldekortId={nesteMeldekortId}
                           nesteEtterregistrerteMeldekortId={nesteEtterregistrerteMeldekortId}
                           nesteMeldekortKanSendes={nesteMeldekortKanSendes}
      />
    }
  ]);

  render(<RouterProvider router={testRouter} />);
};
