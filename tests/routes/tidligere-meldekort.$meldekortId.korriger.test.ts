import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { TEST_MELDEKORT_API_URL, TEST_MIN_SIDE_URL, TEST_URL } from "../helpers/setup";
import { loader } from "~/routes/tidligere-meldekort.$meldekortId.korriger";
import { jsonify, opprettTestMeldekort, opprettTestMeldekortdetaljer, TEST_PERSON_INFO } from "../mocks/data";


describe("Korriger tidligere meldekort", () => {
  vi.stubEnv("IS_LOCALHOST", "true")

  beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
  afterAll(() => server.close())
  afterEach(() => server.resetHandlers())

  const meldekortId = "1707156949"
  const request = new Request(TEST_URL + "/tidligere-meldekort/korriger")

  const check = async (meldekortId?: string) => {
    const response = await loader({
      request,
      params: { meldekortId },
      context: {}
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      feil: true,
      valgtMeldekort: undefined,
      meldekortdetaljer: null,
      personInfo: null,
      minSideUrl: TEST_MIN_SIDE_URL
    })
  }

  test("Skal få feil = true hvis det ikke finnes meldekortId i params", async () => {
    await check()
  })

  test("Skal få feil = true hvis det finnes meldekortId i params men feil med historiskemeldekort", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/historiskemeldekort`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    )

    await check(meldekortId)
  })

  test("Skal få feil = true hvis det finnes meldekortId i params men feil med meldekortdetaljer", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/meldekort/${meldekortId}`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    )

    await check(meldekortId)
  })

  test("Skal få feil = true hvis det finnes meldekortId i params men feil med personInfo", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/info`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    )

    await check(meldekortId)
  })

  test("Skal få feil = false og data fra backend", async () => {
    const meldekort = opprettTestMeldekort(Number(meldekortId))
    jsonify(meldekort)

    const meldekortdetaljerData = opprettTestMeldekortdetaljer(Number(meldekortId))
    jsonify(meldekortdetaljerData)

    const response = await loader({
      request,
      params: { meldekortId: meldekortId },
      context: {}
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      feil: false,
      valgtMeldekort: meldekort,
      meldekortdetaljer: meldekortdetaljerData,
      personInfo: TEST_PERSON_INFO,
      minSideUrl: TEST_MIN_SIDE_URL
    })
  })
})
