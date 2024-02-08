import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { catchErrorResponse } from "../helpers/response-helper";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";
import { TEST_MELDEKORT_API_URL } from "../helpers/setup";
import { jsonify, TEST_PERSON, TEST_PERSON_INFO } from "../mocks/data";
import { hentPerson, hentPersonInfo } from "~/models/person";

// OBS! Kan ikke kjøres parallelt!
describe("Person", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
  afterAll(() => server.close())
  afterEach(() => server.resetHandlers())

  test("hentPerson skal få status 500 når feil i backend", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/meldekort`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    )

    const response = await catchErrorResponse(() => hentPerson(""))

    expect(response.status).toBe(500)
    expect(response.statusText).toBe("Internal Server Error")
  })

  test("hentPersonInfo skal få status 500 når feil i backend", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/info`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    )

    const response = await catchErrorResponse(() => hentPersonInfo(""))

    expect(response.status).toBe(500)
    expect(response.statusText).toBe("Internal Server Error")
  })

  test("hentPerson skal få data", async () => {
    const expectedData = { ...TEST_PERSON } // Clone
    jsonify(expectedData)

    const response = await hentPerson("")

    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toStrictEqual(expectedData)
  })

  test("hentPersonInfo skal få data", async () => {
    const response = await hentPersonInfo("")

    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toStrictEqual(TEST_PERSON_INFO)
  })

  test("hentPerson skal få status 500 når feil i fetch", async () => {
    // Stopper server slik at fetch kaster exception
    server.close()

    const response = await catchErrorResponse(() => hentPerson(""))

    expect(response.status).toBe(500)
    expect(response.statusText).toBe("fetch failed")
  })

  test("hentPersonInfo skal få status 500 når feil i fetch", async () => {
    // Server har blitt allerede stoppet

    const response = await catchErrorResponse(() => hentPersonInfo(""))

    expect(response.status).toBe(500)
    expect(response.statusText).toBe("fetch failed")
  })

  // OBS! Ikke skriv andre tester her videre hvis du trenger fungerende server, den er allerede stoppet
})
