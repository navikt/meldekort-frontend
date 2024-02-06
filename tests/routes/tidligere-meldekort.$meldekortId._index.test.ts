import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { TEST_MELDEKORT_API_URL, TEST_URL } from "../helpers/setup";
import { loader } from "~/routes/tidligere-meldekort.$meldekortId._index";
import { jsonify, opprettTestMeldekort, opprettTestMeldekortdetaljer } from "../mocks/data";


describe("Tidligere meldekort detaljer", () => {
  vi.stubEnv("IS_LOCALHOST", "true")

  beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
  afterAll(() => server.close())
  afterEach(() => server.resetHandlers())

  const meldekortId = "1707156949"

  test("Skal få feil = true hvis det ikke finnes meldekortId i params", async () => {
    const response = await loader({
      request: new Request(TEST_URL + "/tidligere-meldekort"),
      params: {},
      context: {}
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ feil: true, valgtMeldekort: undefined, meldekortdetaljer: null })
  })

  test("Skal få feil = true hvis det finnes meldekortId i params men feil med historiskemeldekort", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/historiskemeldekort`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    )

    const response = await loader({
      request: new Request(TEST_URL + "/tidligere-meldekort"),
      params: { meldekortId },
      context: {}
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ feil: true, valgtMeldekort: undefined, meldekortdetaljer: null })
  })

  test("Skal få feil = true hvis det finnes meldekortId i params men feil med meldekortdetaljer", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/meldekort/${meldekortId}`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    )

    const response = await loader({
      request: new Request(TEST_URL + "/tidligere-meldekort"),
      params: { meldekortId },
      context: {}
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ feil: true, valgtMeldekort: undefined, meldekortdetaljer: null })
  })

  test("Skal få feil = false og data fra backend", async () => {
    const meldekort = opprettTestMeldekort(Number(meldekortId))
    jsonify(meldekort)

    const meldekortdetaljerData = opprettTestMeldekortdetaljer(Number(meldekortId))
    jsonify(meldekortdetaljerData)


    const response = await loader({
      request: new Request(TEST_URL + "/tidligere-meldekort"),
      params: { meldekortId: meldekortId },
      context: {}
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ feil: false, valgtMeldekort: meldekort, meldekortdetaljer: meldekortdetaljerData })
  })
})
