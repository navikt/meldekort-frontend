import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { catchErrorResponse } from "../helpers/response-helper";
import { hentHistoriskeMeldekort } from "~/models/meldekort";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";
import { TEST_MELDEKORT_API_URL } from "../helpers/setup";
import { jsonify, TEST_HISTORISKEMELDEKORT } from "../mocks/data";

// Kan ikke kjøres parallelt!
describe("Meldekort", () => {
  vi.stubEnv("IS_LOCALHOST", "true")

  beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
  afterAll(() => server.close())
  afterEach(() => server.resetHandlers())

  test("hentHistoriskeMeldekort skal få status 500 når feil i backend", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/historiskemeldekort`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    )

    const historiskeMeldekortResponse = await catchErrorResponse(() => hentHistoriskeMeldekort(""))

    expect(historiskeMeldekortResponse.status).toBe(500)
    expect(historiskeMeldekortResponse.statusText).toBe("Internal Server Error")
  })

  test("hentHistoriskeMeldekort skal få data", async () => {
    const expectedData = [...TEST_HISTORISKEMELDEKORT] // Clone
    jsonify(expectedData)

    const historiskeMeldekortResponse = await hentHistoriskeMeldekort("")

    const historiskeMeldekort = await historiskeMeldekortResponse.json()

    expect(historiskeMeldekortResponse.status).toBe(200)
    expect(historiskeMeldekort).toStrictEqual(expectedData)
  })

  test("hentHistoriskeMeldekort skal få status 500 når feil i fetch", async () => {
    // Stopper server slik at fetch kaster exception
    server.close()

    const historiskeMeldekortResponse = await catchErrorResponse(() => hentHistoriskeMeldekort(""))

    expect(historiskeMeldekortResponse.status).toBe(500)
    expect(historiskeMeldekortResponse.statusText).toBe("fetch failed")
  })
})
