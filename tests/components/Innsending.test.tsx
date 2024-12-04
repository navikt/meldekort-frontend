import type { Jsonify } from "@remix-run/server-runtime/dist/jsonify";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";

import Innsending from "~/components/innsending/Innsending";
import { Innsendingstype } from "~/models/innsendingstype";
import type { IMeldekort } from "~/models/meldekort";
import type { IValideringsResultat } from "~/models/meldekortdetaljerInnsending";
import { sporsmalConfig } from "~/models/sporsmal";
import { formaterPeriodeTilUkenummer } from "~/utils/datoUtils";
import { opprettSporsmal } from "~/utils/miscUtils";

import {
  jsonify,
  opprettTestMeldekort, TEST_INFOMELDING,
  TEST_MELDEKORT_VALIDERINGS_RESULTAT_FEIL,
  TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK,
  TEST_PERSON_INFO,
} from "../mocks/data";


describe("Innsending", () => {
  vi.mock("react-i18next", async () =>
    (await vi.importActual("tests/mocks/react-i18next.ts")).mock,
  );

  afterEach(() => {
    cleanup();
  });

  test(
    "Det skal vare mulig å gå fram og tilbake og sende meldekort",
    async () => {
      await createRouteAndRenderAndCheckCommon(TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK);

      // Sjekk at vi viser 4-Kvittering
      const tittel = await waitFor(() => screen.findByTestId("sideTittel"));
      expect(tittel.innerHTML).toBe("overskrift.steg4");
    },
    7000,
  );

  test("Skal vise modal og gå fra steg 1 til 3 hvis alle aktivitetsspørsmålene er Nei", async () => {
    await createRouteAndRender(TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK);

    // Svar Nei på alle spørsmålene
    sporsmalConfig.forEach((item) => {
      fireEvent.click(screen.getByTestId(item.sporsmal + ".false"));
    });

    // Klikk Neste
    fireEvent.click(screen.getByText("naviger.neste"));

    // Sjekk at vi viser modal
    await waitFor(() => screen.findByText("sporsmal.bekreftelse"));

    // Klikk Endre i modal
    fireEvent.click(screen.getByText("sporsmal.tilbakeEndre"));

    // Klikk Neste
    fireEvent.click(screen.getByText("naviger.neste"));

    // Sjekk at vi viser modal igjen
    await waitFor(() => screen.findByText("sporsmal.bekreftelse"));

    // Klikk Bekreft i modal
    fireEvent.click(screen.getByText("overskrift.bekreftOgFortsett"));

    // Sjekk at vi viser 3-Kvittering
    let tittel = await waitFor(() => screen.findByTestId("sideTittel"));
    expect(tittel.innerHTML).toBe("overskrift.steg3");

    // Klikk Forrige
    fireEvent.click(screen.getByText("naviger.forrige"));

    // Sjekk at vi viser 1-Sporsmal
    tittel = await waitFor(() => screen.findByTestId("sideTittel"));
    expect(tittel.innerHTML).toBe("overskrift.steg1");
  });

  test("Skal vise feilmeldinger hvis innsending er feil", async () => {
    await createRouteAndRenderAndCheckCommon(TEST_MELDEKORT_VALIDERINGS_RESULTAT_FEIL);

    // Sjekk at vi viser 2-Utfylling
    const tittel = await waitFor(() => screen.findByTestId("sideTittel"));
    expect(tittel.innerHTML).toBe("overskrift.steg2");
  });

  test("Skal vise feilmeldinger hvis innsending = undefined", async () => {
    await createRouteAndRenderAndCheckCommon(undefined);

    // Sjekk at vi viser feilmelding
    await waitFor(() => screen.findByText("meldekortkontroll.feilkode.00"));
  });

  test("Skal vise feilmeldinger hvis status er uforventet", async () => {
    await createRouteAndRenderAndCheckCommon({
      meldekortId: 1,
      status: "!",
      arsakskoder: null,
      meldekortdager: null,
    });

    // Sjekk at vi viser feilmelding
    await waitFor(() => screen.findByText("meldekortkontroll.feilkode.00"));
  });

  test("Skal vise feilmeldinger hvis baksystemFeil = true", async () => {
    await createRouteAndRenderAndCheckCommon(TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK, true);

    // Sjekk at vi viser feilmelding
    await waitFor(() => screen.findByText("meldekortkontroll.feilkode.00"));
  });

  test("Spørsmål 5 skal vare Ja ved Etterregistrering", async () => {
    await createRouteAndRender(TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK, false, Innsendingstype.ETTERREGISTRERING);

    const radioJa = screen.getByTestId("sporsmal.registrert.true");
    expect(radioJa.attributes.getNamedItem("checked")).toBeTruthy();
    expect(radioJa.attributes.getNamedItem("disabled")).toBeTruthy();

    const radioNei = screen.getByTestId("sporsmal.registrert.false");
    expect(radioNei.attributes.getNamedItem("checked")).toBeFalsy();
    expect(radioNei.attributes.getNamedItem("disabled")).toBeTruthy();
  });

  test("Spørsmål 5 skal vare disabled og begrunnelse skal vare påkrevd ved Korrigering", async () => {
    await createRouteAndRender(TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK, false, Innsendingstype.KORRIGERING, false);

    const radioJa = screen.getByTestId("sporsmal.registrert.true");
    expect(radioJa.attributes.getNamedItem("checked")).toBeFalsy();
    expect(radioJa.attributes.getNamedItem("disabled")).toBeTruthy();

    const radioNei = screen.getByTestId("sporsmal.registrert.false");
    expect(radioNei.attributes.getNamedItem("checked")).toBeTruthy();
    expect(radioNei.attributes.getNamedItem("disabled")).toBeTruthy();

    // Klikk Neste
    fireEvent.click(screen.getByText("naviger.neste"));

    // Sjekk at vi viser feilmelding
    await waitFor(() => screen.findByText("begrunnelse.required"));

    // Velg begrunnelse
    fireEvent.change(screen.getByLabelText("korrigering.sporsmal.begrunnelse"), { target: { value: "2" } });

    // Svar Ja på alle spørsmålene
    sporsmalConfig.forEach((item) => {
      fireEvent.click(screen.getByTestId(item.sporsmal + ".true"));
    });

    // Klikk Neste
    fireEvent.click(screen.getByText("naviger.neste"));

    // Sjekk at vi viser 2-Utfylling
    const tittel = await waitFor(() => screen.findByTestId("sideTittel"));
    expect(tittel.innerHTML).toBe("overskrift.steg2");
  });
});

const createRouteAndRender = async (
  valideringsResultat: IValideringsResultat | undefined,
  baksystemFeil: boolean = false,
  innsendingstype: Innsendingstype = Innsendingstype.INNSENDING,
  arbeidssoker: boolean | null = null,
) => {
  const valgtMeldekort = opprettTestMeldekort(1707696000);
  jsonify(valgtMeldekort);
  const periode = valgtMeldekort.meldeperiode;

  const testRouter = createMemoryRouter([
    {
      path: "/",
      element: <Innsending innsendingstype={innsendingstype}
                           valgtMeldekort={(valgtMeldekort as unknown) as Jsonify<IMeldekort>}
                           nesteMeldekortId={2}
                           nesteEtterregistrerteMeldekortId={3}
                           nesteMeldekortKanSendes={"2024-02-01"}
                           sporsmal={opprettSporsmal(valgtMeldekort.meldegruppe, arbeidssoker)}
                           personInfo={TEST_PERSON_INFO}
                           infomelding={TEST_INFOMELDING}
      />,
      action: () => {
        return {
          baksystemFeil: baksystemFeil,
          innsending: valideringsResultat,
        };
      },
    },
  ]);

  render(<RouterProvider router={testRouter} />);

  // Sjekk at vi viser 1-Sporsmal
  await waitFor(() => screen.findByText(TEST_INFOMELDING.engelsk));
  await waitFor(() => screen.findByText("meldekort.for.perioden"));
  await waitFor(() => screen.findByText("overskrift.uke " + formaterPeriodeTilUkenummer(periode.fra, periode.til)));
  const tittel = await waitFor(() => screen.findByTestId("sideTittel"));
  expect(tittel.innerHTML).toBe("overskrift.steg1");
};

const createRouteAndRenderAndCheckCommon = async (valideringsResultat: IValideringsResultat | undefined, baksystemFeil: boolean = false) => {
  await createRouteAndRender(valideringsResultat, baksystemFeil);

  // Klikk Neste
  fireEvent.click(screen.getByText("naviger.neste"));

  // Sjekk at vi viser feilmeldinger
  await waitFor(() => screen.findByText("arbeidet.required"));
  await waitFor(() => screen.findByText("kurs.required"));
  await waitFor(() => screen.findByText("syk.required"));
  await waitFor(() => screen.findByText("annetFravar.required"));
  await waitFor(() => screen.findByText("fortsetteRegistrert.required"));

  // Svar Ja på alle spørsmålene
  sporsmalConfig.forEach((item) => {
    fireEvent.click(screen.getByTestId(item.sporsmal + ".true"));
  });

  // Klikk Neste
  fireEvent.click(screen.getByText("naviger.neste"));

  // Sjekk at vi viser 2-Utfylling
  let tittel = await waitFor(() => screen.findByTestId("sideTittel"));
  expect(tittel.innerHTML).toContain("overskrift.steg2");

  // Klikk Neste
  fireEvent.click(screen.getByText("naviger.neste"));

  // Sjekk at vi viser feilmeldinger
  await waitFor(() => screen.findByText("utfylling.mangler.arbeid"));
  await waitFor(() => screen.findByText("utfylling.mangler.tiltak"));
  await waitFor(() => screen.findByText("utfylling.mangler.syk"));
  await waitFor(() => screen.findByText("utfylling.mangler.ferieFravar"));

  // Skriv inn 5 i første input (mandag) og huk av alle andre aktiviteter for tirsdag, onsdag og torsdag
  fireEvent.change(screen.getByTestId("arbeid1"), { target: { value: "5" } });
  fireEvent.click(screen.getByTestId("kurs2"));
  fireEvent.click(screen.getByTestId("syk3"));
  fireEvent.click(screen.getByTestId("annetFravaer4"));

  // Klikk Neste
  fireEvent.click(screen.getByText("naviger.neste"));

  // Sjekk at vi viser 3-Bekreftelse
  tittel = await waitFor(() => screen.findByTestId("sideTittel"));
  expect(tittel.innerHTML).toBe("overskrift.steg3");

  // Sjekk at det er mulig å tilbake
  fireEvent.click(screen.getByText("naviger.forrige"));
  tittel = await waitFor(() => screen.findByTestId("sideTittel"));
  expect(tittel.innerHTML).toBe("overskrift.steg2");

  fireEvent.click(screen.getByText("naviger.forrige"));
  tittel = await waitFor(() => screen.findByTestId("sideTittel"));
  expect(tittel.innerHTML).toBe("overskrift.steg1");

  // Gå videre til 3-Bekreftelse igjen
  fireEvent.click(screen.getByText("naviger.neste"));
  fireEvent.click(screen.getByText("naviger.neste"));
  tittel = await waitFor(() => screen.findByTestId("sideTittel"));
  expect(tittel.innerHTML).toBe("overskrift.steg3");

  // Klikk Send
  fireEvent.click(screen.getByText("naviger.send"));

  // Sjekk at vi viser feilmelding
  await waitFor(() => screen.findByText("utfylling.bekreft.feil"));

  // Klikk Bekreft
  fireEvent.click(screen.getByLabelText("utfylling.bekreftAnsvar"));

  // Klikk Send
  fireEvent.click(screen.getByText("naviger.send"));
};
