import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { TEST_MELDEKORT_API_URL, TEST_URL } from "../helpers/setup";
import { loader } from "~/routes/send-meldekort_";
import { jsonify, TEST_PERSON } from "../mocks/data";


describe("Send meldekort", () => {
  vi.stubEnv("IS_LOCALHOST", "true")

  beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
  afterAll(() => server.close())

  const request = new Request(TEST_URL + "/send-meldekort")

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
    const expectedPersondata = { ...TEST_PERSON }// Clone
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
})
