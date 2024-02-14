import { afterEach, describe, expect, test } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import Innsending from "~/components/innsending/Innsending";
import { Innsendingstype } from "~/models/innsendingstype";
import type { Jsonify } from "@remix-run/server-runtime/dist/jsonify";
import type { IMeldekort } from "~/models/meldekort";
import {
  jsonify,
  opprettTestMeldekort,
  TEST_MELDEKORT_VALIDERINGS_RESULTAT_FEIL,
  TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK,
  TEST_PERSON_INFO
} from "../mocks/data";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { sporsmalConfig } from "~/models/sporsmal";
import { formaterPeriodeTilUkenummer } from "~/utils/datoUtils";
import { opprettSporsmal } from "~/utils/miscUtils";
import type { IValideringsResultat } from "~/models/meldekortdetaljerInnsending";

describe("Innsending", () => {
  afterEach(() => {
    cleanup()
  })

  test("Det skal vare mulig å gå fram og tilbake og sende meldekort", async () => {
    await createRouteAndRenderAndCheckCommon(TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK)

    // Sjekk at vi viser 4-Kvittering
    const tittel = await waitFor(() => screen.findByTestId("sideTittel"))
    expect(tittel.innerHTML).toBe("overskrift.steg4")
  })

  test("Skal vise modal og gå fra steg 1 til 3 hvis alle aktivitetsspørsmålene er Nei", async () => {
    await createRouteAndRender(TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK)

    // Svar Nei på alle spørsmålene
    sporsmalConfig.forEach((item) => {
      fireEvent.click(screen.getByTestId(item.sporsmal + ".false"))
    })

    // Klikk Neste
    fireEvent.click(screen.getByText("naviger.neste"))

    // Sjekk at vi viser modal
    await waitFor(() => screen.findByText("sporsmal.bekreftelse"))

    // Klikk i modal
    fireEvent.click(screen.getByText("overskrift.bekreftOgFortsett"))

    // Sjekk at vi viser 3-Kvittering
    let tittel = await waitFor(() => screen.findByTestId("sideTittel"))
    expect(tittel.innerHTML).toBe("overskrift.steg3")

    // Klikk Forrige
    fireEvent.click(screen.getByText("naviger.forrige"))

    // Sjekk at vi viser 1-Sporsmal
    tittel = await waitFor(() => screen.findByTestId("sideTittel"))
    expect(tittel.innerHTML).toBe("overskrift.steg1")
  })

  test("Skal vise feilmeldinger hvis innsending er feil", async () => {
    await createRouteAndRenderAndCheckCommon(TEST_MELDEKORT_VALIDERINGS_RESULTAT_FEIL)

    // Sjekk at vi viser 2-Utfylling
    const tittel = await waitFor(() => screen.findByTestId("sideTittel"))
    expect(tittel.innerHTML).toBe("overskrift.steg2")
  })

  test("Skal vise feilmeldinger hvis innsending = undefined", async () => {
    await createRouteAndRenderAndCheckCommon(undefined)

    // Sjekk at vi viser feilmelding
    await waitFor(() => screen.findByText("meldekortkontroll.feilkode.00"))
  })

  test("Skal vise feilmeldinger hvis status er uforventet", async () => {
    await createRouteAndRenderAndCheckCommon({
      meldekortId: 1,
      status: "!",
      arsakskoder: null,
      meldekortdager: null
    })

    // Sjekk at vi viser feilmelding
    await waitFor(() => screen.findByText("meldekortkontroll.feilkode.00"))
  })

  test("Skal vise feilmeldinger hvis baksystemFeil = true", async () => {
    await createRouteAndRenderAndCheckCommon(TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK, true)

    // Sjekk at vi viser feilmelding
    await waitFor(() => screen.findByText("meldekortkontroll.feilkode.00"))
  })
})

const createRouteAndRender = async (valideringsResultat: IValideringsResultat | undefined, baksystemFeil: boolean = false) => {
  const valgtMeldekort = opprettTestMeldekort(1707696000)
  jsonify(valgtMeldekort)
  const periode = valgtMeldekort.meldeperiode

  const testRouter = createMemoryRouter([
    {
      path: "/",
      element: <Innsending innsendingstype={Innsendingstype.INNSENDING}
                           valgtMeldekort={(valgtMeldekort as unknown) as Jsonify<IMeldekort>}
                           nesteMeldekortId={2}
                           nesteEtterregistrerteMeldekortId={3}
                           nesteMeldekortKanSendes={"2024-02-01"}
                           sporsmal={opprettSporsmal(valgtMeldekort.meldegruppe, null)}
                           personInfo={TEST_PERSON_INFO}
                           minSideUrl={""}
      />,
      action: () => {
        return {
          baksystemFeil: baksystemFeil,
          innsending: valideringsResultat
        }
      }
    }
  ]);

  render(<RouterProvider router={testRouter} />)

  // Sjekk at vi viser 1-Sporsmal
  await waitFor(() => screen.findByText("meldekort.for.perioden"))
  await waitFor(() => screen.findByText("overskrift.uke " + formaterPeriodeTilUkenummer(periode.fra, periode.til)))
  let tittel = await waitFor(() => screen.findByTestId("sideTittel"))
  expect(tittel.innerHTML).toBe("overskrift.steg1")
}

const createRouteAndRenderAndCheckCommon = async (valideringsResultat: IValideringsResultat | undefined, baksystemFeil: boolean = false) => {
  await createRouteAndRender(valideringsResultat, baksystemFeil)

  // Klikk Neste
  fireEvent.click(screen.getByText("naviger.neste"))

  // Sjekk at vi viser feilmeldinger
  await waitFor(() => screen.findByText("arbeidet.required"))
  await waitFor(() => screen.findByText("kurs.required"))
  await waitFor(() => screen.findByText("syk.required"))
  await waitFor(() => screen.findByText("annetFravar.required"))
  await waitFor(() => screen.findByText("fortsetteRegistrert.required"))

  // Svar Ja på alle spørsmålene
  sporsmalConfig.forEach((item) => {
    fireEvent.click(screen.getByTestId(item.sporsmal + ".true"))
  })

  // Klikk Neste
  fireEvent.click(screen.getByText("naviger.neste"))

  // Sjekk at vi viser 2-Utfylling
  let tittel = await waitFor(() => screen.findByTestId("sideTittel"))
  expect(tittel.innerHTML).toContain("overskrift.steg2")

  // Klikk Neste
  fireEvent.click(screen.getByText("naviger.neste"))

  // Sjekk at vi viser feilmeldinger
  await waitFor(() => screen.findByText("utfylling.mangler.arbeid"))
  await waitFor(() => screen.findByText("utfylling.mangler.tiltak"))
  await waitFor(() => screen.findByText("utfylling.mangler.syk"))
  await waitFor(() => screen.findByText("utfylling.mangler.ferieFravar"))

  // Skriv inn 5 i første input (mandag) og huk av alle andre aktiviteter for tirsdag, onsdag og torsdag
  fireEvent.change(screen.getByTestId("arbeid1"), { target: { value: "5" } })
  fireEvent.click(screen.getByTestId("kurs2"))
  fireEvent.click(screen.getByTestId("syk3"))
  fireEvent.click(screen.getByTestId("annetFravaer4"))

  // Klikk Neste
  fireEvent.click(screen.getByText("naviger.neste"))

  // Sjekk at vi viser 3-Bekreftelse
  tittel = await waitFor(() => screen.findByTestId("sideTittel"))
  expect(tittel.innerHTML).toBe("overskrift.steg3")

  // Sjekk at det er mulig å tilbake
  fireEvent.click(screen.getByText("naviger.forrige"))
  tittel = await waitFor(() => screen.findByTestId("sideTittel"))
  expect(tittel.innerHTML).toBe("overskrift.steg2")

  fireEvent.click(screen.getByText("naviger.forrige"))
  tittel = await waitFor(() => screen.findByTestId("sideTittel"))
  expect(tittel.innerHTML).toBe("overskrift.steg1")

  // Gå videre til 3-Bekreftelse igjen
  fireEvent.click(screen.getByText("naviger.neste"))
  fireEvent.click(screen.getByText("naviger.neste"))
  tittel = await waitFor(() => screen.findByTestId("sideTittel"))
  expect(tittel.innerHTML).toBe("overskrift.steg3")

  // Klikk Send
  fireEvent.click(screen.getByText("naviger.send"))

  // Sjekk at vi viser feilmelding
  await waitFor(() => screen.findByText("utfylling.bekreft.feil"))

  // Klikk Bekreft
  fireEvent.click(screen.getByLabelText("utfylling.bekreftAnsvar"))

  // Klikk Send
  fireEvent.click(screen.getByText("naviger.send"))
}
