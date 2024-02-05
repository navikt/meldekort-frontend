import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { MELDEKORT_API_URL, TEST_URL } from "../helpers/setup";
import { loader } from "~/routes/etterregistrering_";
import { opprettTestPerson } from "../mocks/data";


describe("Etterregistrering", () => {
  vi.stubEnv("IS_LOCALHOST", "true")

  beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
  afterAll(() => server.close())

  test("Skal få feil = true og person = null når feil på backend", async () => {
    server.use(
      http.get(
        `${MELDEKORT_API_URL}/person/meldekort`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    )

    const response = await loader({
      request: new Request(TEST_URL + "/etteregistrering"),
      params: {},
      context: {}
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ feil: true, person: null })
  })

  test("Skal få feil = false og person-objektet fra backend", async () => {
    const response = await loader({
      request: new Request(TEST_URL + "/etteregistrering"),
      params: {},
      context: {}
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ feil: false, person: opprettTestPerson() })
  })
})
