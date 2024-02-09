import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { TEST_MELDEKORT_API_URL, TEST_URL } from "../helpers/setup";
import Etterregistrering, { loader, meta } from "~/routes/etterregistrering_";
import { jsonify, TEST_PERSON } from "../mocks/data";
import { createRemixStub } from "@remix-run/testing";
import { json } from "@remix-run/node";
import { render, screen, waitFor } from "@testing-library/react";
import type { ServerRuntimeMetaArgs } from "@remix-run/server-runtime/dist/routeModules";
import { KortStatus } from "~/models/meldekort";


describe("Etterregistrering", () => {
  vi.stubEnv("IS_LOCALHOST", "true")

  beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
  afterAll(() => server.close())

  const request = new Request(TEST_URL + "/etteregistrering")

  test("Skal få feil = true og person = null når feil på backend", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/meldekort`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    )

    const response = await loader({
      request,
      params: {},
      context: {}
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ feil: true, person: null })
  })

  test("Skal få feil = false og person-objektet fra backend", async () => {
    const expectedPersondata = { ...TEST_PERSON } // Clone
    jsonify(expectedPersondata)

    const response = await loader({
      request,
      params: {},
      context: {}
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ feil: false, person: expectedPersondata })
  })

  test("Skal vise feilmelding hvis feil = true", async () => {
    const RemixStub = createRemixStub([
      {
        path: "/",
        Component: Etterregistrering,
        loader() {
          return json({
            feil: true,
            person: null
          })
        }
      }
    ])

    render(<RemixStub />)

    await waitFor(() => screen.findByText("feilmelding.baksystem"))
  })

  test("Skal vise feilmelding hvis person = null", async () => {
    const RemixStub = createRemixStub([
      {
        path: "/",
        Component: Etterregistrering,
        loader() {
          return json({
            feil: false,
            person: null
          })
        }
      }
    ])

    render(<RemixStub />)

    await waitFor(() => screen.findByText("feilmelding.baksystem"))
  })

  test("Skal vise melding når ingen meldekort å sende", async () => {
    const RemixStub = createRemixStub([
      {
        path: "/",
        Component: Etterregistrering,
        loader() {
          return json({
            feil: false,
            person: {
              etterregistrerteMeldekort: []
            }
          })
        }
      }
    ])

    render(<RemixStub />)

    await waitFor(() => screen.findByText("sporsmal.ingenMeldekortASende"))
  })

  test("Skal vise melding innhold når det fines meldekort å sende", async () => {
    const RemixStub = createRemixStub([
      {
        path: "/",
        Component: Etterregistrering,
        loader() {
          return json({
            feil: false,
            person: {
              etterregistrerteMeldekort: [
                {
                  meldekortId: 1,
                  kortStatus: KortStatus.OPPRE,
                  meldeperiode: {
                    fra: new Date(),
                    til: new Date(),
                    kanKortSendes: true,
                    kortKanSendesFra: new Date()
                  }
                },
                {
                  meldekortId: 2,
                  kortStatus: KortStatus.OPPRE,
                  meldeperiode: {
                    fra: new Date(),
                    til: new Date(),
                    kanKortSendes: true,
                    kortKanSendesFra: new Date()
                  }
                }
              ]
            }
          })
        }
      }
    ])
    render(<RemixStub />)

    await waitFor(() => screen.findByText("sendMeldekort.info.kanSende"))
    await waitFor(() => screen.findByText("overskrift.periode"))
    await waitFor(() => screen.findByText("overskrift.dato"))
    await waitFor(() => screen.findByText("naviger.neste"))
  })

  test("Skal returnere metainformasjon", async () => {
    const args = {} as ServerRuntimeMetaArgs

    expect(meta(args)).toStrictEqual([
      { title: "Meldekort" },
      { name: "description", content: "Etterregistrering" }
    ])
  })
})
