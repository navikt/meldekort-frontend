import { describe, expect, test, vi } from "vitest";
import { FALLBACK_TOKEN, getOboToken } from "~/utils/authUtils";
import { catchErrorResponse } from "../helpers/response-helper";


describe("Auth utils", () => {
  test("getOboToken skal returnere FALLBACK_TOKEN på localhost uten MELDEKORT_API_TOKEN", async () => {
    vi.stubEnv("IS_LOCALHOST", "true")

    const result = await getOboToken(new Request("http://localhost"))
    expect(result).toBe(FALLBACK_TOKEN)
  })

  test("getOboToken skal returnere MELDEKORT_API_TOKEN på localhost med MELDEKORT_API_TOKEN", async () => {
    vi.stubEnv("IS_LOCALHOST", "true")
    vi.stubEnv("MELDEKORT_API_TOKEN", "testToken")

    const result = await getOboToken(new Request("http://localhost"))
    expect(result).toBe("testToken")
  })

  test("getOboToken skal returnere feil uten session", async () => {
    vi.stubEnv("IS_LOCALHOST", "false")

    const result = await catchErrorResponse(() => getOboToken(new Request("http://localhost")))
    expect(result.status).toBe(500)
    expect(result.statusText).toBe("Feil ved henting av sesjon")
  })
})
