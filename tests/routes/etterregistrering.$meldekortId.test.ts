import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { TEST_MELDEKORT_API_URL, TEST_MIN_SIDE_URL, TEST_URL } from "../helpers/setup";
import { action, loader } from "~/routes/etterregistrering.$meldekortId";
import {
  jsonify,
  opprettTestMeldekort,
  TEST_MELDEKORT_VALIDERINGS_RESULTAT_FEIL,
  TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK,
  TEST_PERSON_INFO
} from "../mocks/data";
import type { IValideringsResultat } from "~/models/meldekortdetaljerInnsending";


describe("Etterregistrer meldekort", () => {
  vi.stubEnv("IS_LOCALHOST", "true")

  beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
  afterAll(() => server.close())
  afterEach(() => server.resetHandlers())

  const meldekortId = "1707156947"
  const request = new Request(TEST_URL + "/etteregistrering")

  const checkLoader = async (meldekortId?: string) => {
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
      nesteMeldekortId: undefined,
      nesteEtterregistrerteMeldekortId: undefined,
      personInfo: null,
      minSideUrl: TEST_MIN_SIDE_URL
    })
  }

  const checkAction = async (baksystemFeil: boolean, innsending: IValideringsResultat | null) => {
    const body = new URLSearchParams({});

    const request = new Request(TEST_URL + "/person/meldekort", {
      method: "POST",
      body,
    });

    const response = await action({
      request,
      params: {},
      context: {}
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      baksystemFeil,
      innsending
    })
  }

  test("Skal få feil = true hvis det ikke finnes meldekortId i params", async () => {
    await checkLoader()
  })

  test("Skal få feil = true hvis det finnes meldekortId i params men feil med person", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/meldekort`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    )

    await checkLoader(meldekortId)
  })

  test("Skal få feil = true hvis det finnes meldekortId i params men feil med personInfo", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/info`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    )

    await checkLoader(meldekortId)
  })

  test("Skal få feil = false og data fra backend", async () => {
    const expectedValgtMeldekort = opprettTestMeldekort(Number(meldekortId))
    jsonify(expectedValgtMeldekort)

    const response = await loader({
      request,
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
      personInfo: TEST_PERSON_INFO,
      minSideUrl: TEST_MIN_SIDE_URL
    })
  })

  test("Skal få baksystemFeil = true når feil ved innsending av meldekort", async () => {
    server.use(
      http.post(
        `${TEST_MELDEKORT_API_URL}/person/meldekort`,
        () => new HttpResponse(null, { status: 500 })
      )
    )

    await checkAction(true, null)
  })

  test("Skal få FEIL resultat ved innsending av meldekort", async () => {
    server.use(
      http.post(
        `${TEST_MELDEKORT_API_URL}/person/meldekort`,
        () => HttpResponse.json(TEST_MELDEKORT_VALIDERINGS_RESULTAT_FEIL, { status: 200 })
      )
    )

    await checkAction(false, TEST_MELDEKORT_VALIDERINGS_RESULTAT_FEIL)
  })

  test("Skal få OK resultat ved innsending av meldekort", async () => {
    await checkAction(false, TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK)
  })
})
