import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { catchErrorResponse } from "../helpers/response-helper";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";
import { TEST_MELDEKORT_API_URL } from "../helpers/setup";
import { TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK } from "../mocks/data";
import { sendInnMeldekortAction } from "~/models/meldekortdetaljerInnsending";
import type { ActionFunctionArgs, AppLoadContext } from "@remix-run/node";
import type { Params } from "@remix-run/router/utils";

// Kan ikke kjøres parallelt!
describe("Meldekortdetaljer Innsending", () => {
  vi.stubEnv("IS_LOCALHOST", "true")

  beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
  afterAll(() => server.close())
  afterEach(() => server.resetHandlers())

  const opprettActionFunctionArgs = () => {
    const body = new FormData()
    body.append("meldekortdetaljer", "{}")

    const request = new Request(
      "http://localhost",
      {
        method: "POST",
        body
      }
    )
    const params: Params = {}
    const context: AppLoadContext = {}

    const actionFunctionArgs: ActionFunctionArgs = {
      request,
      params,
      context
    }

    return actionFunctionArgs
  }

  test("sendInnMeldekortAction skal få baksystemFeil = true når feil i backend", async () => {
    server.use(
      http.post(
        `${TEST_MELDEKORT_API_URL}/person/meldekort`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    )

    const response = await catchErrorResponse(() => sendInnMeldekortAction(opprettActionFunctionArgs()))

    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({
      baksystemFeil: true,
      innsending: null
    })
  })

  test("sendInnMeldekortAction skal få data", async () => {
    const response = await sendInnMeldekortAction(opprettActionFunctionArgs())

    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toStrictEqual({
      baksystemFeil: false,
      innsending: TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK
    })
  })

  test("sendInnMeldekortAction skal få baksystemFeil = true når feil i fetch", async () => {
    // Stopper server slik at fetch kaster exception
    server.close()

    const response = await catchErrorResponse(() => sendInnMeldekortAction(opprettActionFunctionArgs()))

    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({
      baksystemFeil: true,
      innsending: null
    })
  })

  // OBS! Ikke skriv andre tester her videre hvis du trenger fungerende server, den er allerede stoppet
})
