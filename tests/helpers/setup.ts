export const TEST_PORT = 8079
export const TEST_URL = "http://localhost:" + TEST_PORT
export const MELDEKORT_API_URL = "https://meldekort-api"

if (typeof window !== "undefined") {
  window.env = window.env || {}
  window.env.MELDEKORT_API_URL = MELDEKORT_API_URL
}
