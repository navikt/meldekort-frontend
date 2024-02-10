import { describe, expect, test, vi } from "vitest";
import { beforeAndAfterSetup, renderRemixStub } from "./helpers/test-helpers";
import { server } from "./mocks/server";
import { http, HttpResponse } from "msw";
import { TEST_MELDEKORT_API_URL, TEST_URL } from "./helpers/setup";
import App, { links, loader } from "~/root";
import { TEST_DECORATOR_FRAGMENTS, TEST_SKRIVEMODUS } from "./mocks/data";
import { json } from "@remix-run/node";
import { screen, waitFor } from "@testing-library/react";

describe("Root", () => {
  vi.stubEnv("IS_LOCALHOST", "true")
  vi.mock('react-i18next', () => ({
    useTranslation: () => {
      return {
        t: (args: string[]) => args[1],
        i18n: {
          changeLanguage: () => new Promise(() => {
          }),
          setDefaultNamespace: (ns: string) => {
          },
          dir: () => {
          }
        },
        ready: true
      }
    },
    initReactI18next: {
      type: '3rdParty',
      init: () => {
      }
    }
  }))

  beforeAndAfterSetup()

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

  test("Skal returnere links", async () => {
    expect(links().length).toBe(0) // Vi har ikke cssBundleHref i test
  })
})
