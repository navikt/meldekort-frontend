import { describe, expect, test, vi } from "vitest";
import { beforeAndAfterSetup, renderRemixStub } from "./helpers/test-helpers";
import { server } from "./mocks/server";
import { http, HttpResponse } from "msw";
import { TEST_MELDEKORT_API_URL, TEST_URL } from "./helpers/setup";
import App, { ErrorBoundary, links, loader } from "~/root";
import { TEST_DECORATOR_FRAGMENTS, TEST_PERSON_STATUS, TEST_SKRIVEMODUS } from "./mocks/data";
import { json } from "@remix-run/node";
import { render, screen, waitFor } from "@testing-library/react";
import { createRemixStub } from "@remix-run/testing";


describe("Root", () => {
  vi.mock("react-i18next", async () =>
    (await vi.importActual("tests/mocks/react-i18next.ts")).mock
  )

  beforeAndAfterSetup()

  test("Skal få feil = true når feil med erViggo", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/viggo/erViggo`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    )

    const response = await loader({
      request: new Request(TEST_URL),
      params: {},
      context: {}
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.feil).toEqual(true)
  })

  test("Skal sende til DP når erViggo = true", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/viggo/erViggo`,
        () => new HttpResponse(null, { status: 307 }),
        { once: true }
      )
    )

    const response = await loader({
      request: new Request(TEST_URL),
      params: {},
      context: {}
    })

    expect(response.status).toBe(307)
  })

  test("Skal sende til send-meldekort fra ikke-tilgang når personStatus er OK", async () => {
    const response = await loader({
      request: new Request(TEST_URL + "/ikke-tilgang"),
      params: {},
      context: {}
    })

    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toBe("/send-meldekort")
  })

  test("Skal sende til ikke-tilgang når feil med personStatus", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/status`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    )

    const response = await loader({
      request: new Request(TEST_URL),
      params: {},
      context: {}
    })

    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toBe("/ikke-tilgang")
  })

  test("Skal sende til ikke-tilgang når personstatus.id er tom", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/status`,
        () => HttpResponse.json({ id: "" }, { status: 200 }),
        { once: true }
      )
    )

    const response = await loader({
      request: new Request(TEST_URL),
      params: {},
      context: {}
    })

    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toBe("/ikke-tilgang")
  })

  test("Skal få feil = true når feil med skrivemodus", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/skrivemodus`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    )

    const response = await loader({
      request: new Request(TEST_URL),
      params: {},
      context: {}
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.locale).toEqual("nb")
    expect(data.feil).toEqual(true)
    expect(data.skrivemodus).toEqual(null)
  })

  test("Skal returnere skrivemodus", async () => {
    const response = await loader({
      request: new Request(TEST_URL),
      params: {},
      context: {}
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.locale).toEqual("nb")
    expect(data.feil).toEqual(false)
    expect(data.skrivemodus).toEqual(TEST_SKRIVEMODUS)
  })

  test("Skal vise feilmelding hvis feil = true", async () => {
    renderRemixStub(
      App,
      () => {
        return json({
          feil: true,
          personStatus: TEST_PERSON_STATUS,
          skrivemodus: null,
          fragments: TEST_DECORATOR_FRAGMENTS
        })
      }
    )

    await waitFor(() => screen.findByText("feilmelding.baksystem"))
  })

  test("Skal vise feilmelding hvis skrivemodus = null", async () => {
    renderRemixStub(
      App,
      () => {
        return json({
          feil: false,
          personStatus: TEST_PERSON_STATUS,
          skrivemodus: null,
          fragments: TEST_DECORATOR_FRAGMENTS
        })
      }
    )

    await waitFor(() => screen.findByText("feilmelding.baksystem"))
  })

  test("Skal vise feilmelding hvis skrivemodus = false", async () => {
    renderRemixStub(
      App,
      () => {
        return json({
          feil: false,
          personStatus: TEST_PERSON_STATUS,
          skrivemodus: {
            skrivemodus: false,
          },
          fragments: TEST_DECORATOR_FRAGMENTS
        })
      }
    )

    await waitFor(() => screen.findByText("skrivemodusInfomelding"))
  })

  test("Skal vise feilmelding fra skrivemodus hvis den finnes", async () => {
    renderRemixStub(
      App,
      () => {
        return json({
          feil: false,
          personStatus: TEST_PERSON_STATUS,
          skrivemodus: {
            skrivemodus: false,
            melding: {
              norsk: "NORSK FEILMELDING",
              engelsk: "ENGLISH ERROR"
            }
          },
          fragments: TEST_DECORATOR_FRAGMENTS
        })
      }
    )

    await waitFor(() => screen.findByText("ENGLISH ERROR"))
  })

  test("Skal vise innhold", async () => {
    renderRemixStub(
      App,
      () => {
        return json({
          feil: false,
          personStatus: TEST_PERSON_STATUS,
          skrivemodus: {
            skrivemodus: true
          },
          fragments: TEST_DECORATOR_FRAGMENTS
        })
      }
    )

    await waitFor(() => screen.findByText("DECORATOR HEADER"))
    await waitFor(() => screen.findByText("DECORATOR FOOTER"))
  })

  test("Skal vise ErrorBoundary", async () => {
    const RemixStub = createRemixStub([
      {
        path: "/",
        Component: App,
        loader: () => {
          throw new Error()
        },
        ErrorBoundary: ErrorBoundary
      }
    ])

    render(<RemixStub />)

    await waitFor(() => screen.findByText("Feil i baksystem / System error"))
  })

  test("Skal returnere links", async () => {
    expect(links().length).toBe(0) // Vi har ikke cssBundleHref i test
  })
})
