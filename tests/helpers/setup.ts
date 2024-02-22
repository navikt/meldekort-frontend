export const TEST_PORT = 8079;
export const TEST_URL = "http://localhost:" + TEST_PORT;
export const TEST_MELDEKORT_API_URL = "https://meldekort-api";
export const TEST_MIN_SIDE_URL = "https://min-side";
export const TEST_AMPLITUDE_API_KEY = "KEY";

if (typeof window !== "undefined") {
  window.env = window.env || {};
  window.env.MELDEKORT_API_URL = TEST_MELDEKORT_API_URL;
  window.env.MIN_SIDE_URL = TEST_MIN_SIDE_URL;
  window.env.IS_LOCALHOST = "true";
  window.env.AMPLITUDE_API_KEY = TEST_AMPLITUDE_API_KEY;
  window.scrollTo = () => {};
  window.print = () => {};
}
