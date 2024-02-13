import { describe, expect, test } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Innsending from "~/components/innsending/Innsending";
import { Innsendingstype } from "~/models/innsendingstype";
import type { Jsonify } from "@remix-run/server-runtime/dist/jsonify";
import type { IMeldekort } from "~/models/meldekort";
import {
  jsonify,
  opprettTestMeldekort,
  TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK,
  TEST_PERSON_INFO,
  TEST_SPORSMAL
} from "../mocks/data";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { sporsmalConfig } from "~/models/sporsmal";
import { formaterPeriodeTilUkenummer } from "~/utils/datoUtils";

describe("Innsending", () => {
  test("Skal vise innhold", async () => {
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
                             sporsmal={TEST_SPORSMAL}
                             personInfo={TEST_PERSON_INFO}
                             minSideUrl={""}
        />,
        action: () => {
          return {
            baksystemFeil: false,
            innsending: TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK
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

    // Svar Ja på alle spørsmålene
    sporsmalConfig.forEach((item) => {
      fireEvent.click(screen.getByTestId(item.sporsmal + ".true"))
    })

    // Klikk Neste
    fireEvent.click(screen.getByText("naviger.neste"))

    // Sjekk at vi viser 2-Utfylling
    tittel = await waitFor(() => screen.findByTestId("sideTittel"))
    expect(tittel.innerHTML).toContain("overskrift.steg2")

    // Skriv inn 5 i første input og huk av alle andre aktiviteter
    fireEvent.change(screen.getByTestId("arbeid1"), { target: { value: "5" } })
    fireEvent.click(screen.getByTestId("kurs2"))
    fireEvent.click(screen.getByTestId("syk3"))
    fireEvent.click(screen.getByTestId("annetFravaer4"))

    // Klikk Neste
    fireEvent.click(screen.getByText("naviger.neste"))

    // Sjekk at vi viser 3-Bekreftelse
    tittel = await waitFor(() => screen.findByTestId("sideTittel"))
    expect(tittel.innerHTML).toBe("overskrift.steg3")

    // Sjekker at det er mulig å tilake
    fireEvent.click(screen.getByText("naviger.forrige"))
    tittel = await waitFor(() => screen.findByTestId("sideTittel"))
    expect(tittel.innerHTML).toBe("overskrift.steg2")

    fireEvent.click(screen.getByText("naviger.forrige"))
    tittel = await waitFor(() => screen.findByTestId("sideTittel"))
    expect(tittel.innerHTML).toBe("overskrift.steg1")

    // Går videre til 3-Bekreftelse igjen
    fireEvent.click(screen.getByText("naviger.neste"))
    fireEvent.click(screen.getByText("naviger.neste"))
    tittel = await waitFor(() => screen.findByTestId("sideTittel"))
    expect(tittel.innerHTML).toBe("overskrift.steg3")

    // Klikk Bekreft
    fireEvent.click(screen.getByLabelText("utfylling.bekreftAnsvar"))

    // Klikk Send
    fireEvent.click(screen.getByText("naviger.send"))

    // Sjekk at vi viser 4-Kvittering
    tittel = await waitFor(() => screen.findByTestId("sideTittel"))
    expect(tittel.innerHTML).toBe("overskrift.steg4")
  })
})
