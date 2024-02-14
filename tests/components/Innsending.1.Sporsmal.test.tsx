import { afterEach, describe, test } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Innsendingstype } from "~/models/innsendingstype";
import { opprettTestMeldekort } from "../mocks/data";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import * as React from "react";
import type { IMeldekort } from "~/models/meldekort";
import Sporsmal from "~/components/innsending/1-Sporsmal";
import { opprettSporsmal } from "~/utils/miscUtils";


describe("Sporsmal", () => {
  afterEach(() => {
    cleanup()
  })

  test("Skal vise innhold for Korrigering", async () => {
    const valgtMeldekort = opprettTestMeldekort(1707696000)

    createRouteAndRender(valgtMeldekort, Innsendingstype.KORRIGERING)

    await waitFor(() => screen.findByText("sporsmal.lesVeiledning"))
    await waitFor(() => screen.findByText("sporsmal.ansvarForRiktigUtfylling"))
    await waitFor(() => screen.findByText("korrigering.sporsmal.begrunnelse"))
  })
})

const createRouteAndRender = (
  valgtMeldekort: IMeldekort,
  innsendingstype: Innsendingstype
) => {
  const testRouter = createMemoryRouter([
    {
      path: "/",
      element: <Sporsmal innsendingstype={innsendingstype}
                         fom={valgtMeldekort.meldeperiode.fra.toISOString()}
                         ytelsestypePostfix={""}
                         begrunnelse={""}
                         setBegrunnelse={() => {
                         }}
                         sporsmal={opprettSporsmal(valgtMeldekort.meldegruppe, null)}
                         setSporsmal={() => {
                         }}
                         activeStep={1}
                         setActiveStep={() => {
                         }}
      />
    }
  ])

  render(<RouterProvider router={testRouter} />)
}
