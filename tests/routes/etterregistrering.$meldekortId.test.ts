import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { TEST_MELDEKORT_API_URL, TEST_MIN_SIDE_URL, TEST_URL } from "../helpers/setup";
import { loader } from "~/routes/etterregistrering.$meldekortId";
import { jsonify, opprettPersonInfo, opprettTestMeldekort } from "../mocks/data";


describe("Etterregistrer meldekort", () => {
  vi.stubEnv("IS_LOCALHOST", "true")

  beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
  afterAll(() => server.close())
  afterEach(() => server.resetHandlers())

  const meldekortId = "1707156947"

  test("Skal få feil = true hvis det ikke finnes meldekortId i params", async () => {
    const response = await loader({
      request: new Request(TEST_URL + "/etteregistrering"),
      params: {},
      context: {}
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      feil: true,
      valgtMeldekort: undefined,
      nesteMeldekortId: undefined,
      nesteEtterregistrerteMeldekortId: undefined,
      personInfo: null,
      minSideUrl: TEST_MIN_SIDE_URL
    })
  })

  test("Skal få feil = true hvis det finnes meldekortId i params men feil med person", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/meldekort`,
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
    expect(data).toEqual({
      feil: true,
      valgtMeldekort: undefined,
      nesteMeldekortId: undefined,
      nesteEtterregistrerteMeldekortId: undefined,
      personInfo: null,
      minSideUrl: TEST_MIN_SIDE_URL
    })
  })

  test("Skal få feil = true hvis det finnes meldekortId i params men feil med personInfo", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/info`,
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
    expect(data).toEqual({
      feil: true,
      valgtMeldekort: undefined,
      nesteMeldekortId: undefined,
      nesteEtterregistrerteMeldekortId: undefined,
      personInfo: null,
      minSideUrl: TEST_MIN_SIDE_URL
    })
  })

  test("Skal få feil = false og data fra backend", async () => {
    const expectedValgtMeldekort = opprettTestMeldekort(Number(meldekortId))
    jsonify(expectedValgtMeldekort)

    const response = await loader({
      request: new Request(TEST_URL + "/tidligere-meldekort"),
      params: { meldekortId },
      context: {}
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      feil: false,
      valgtMeldekort: expectedValgtMeldekort,
      nesteMeldekortId: 1707156945,
      nesteEtterregistrerteMeldekortId: 1707156948,
      personInfo: opprettPersonInfo(1, "01020312345", "Test", "Testesen"),
      minSideUrl: TEST_MIN_SIDE_URL
    })
  })
})
