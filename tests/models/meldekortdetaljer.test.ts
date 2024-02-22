import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { catchErrorResponse } from "../helpers/response-helper";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";
import { TEST_MELDEKORT_API_URL } from "../helpers/setup";
import { jsonify, TEST_MELDEKORTDETALJER } from "../mocks/data";
import { hentMeldekortdetaljer } from "~/models/meldekortdetaljer";


// Kan ikke kjøres parallelt!
describe("Meldekortdetaljer", () => {

  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  const meldekortId = "1707156949";

  test("hentMeldekortdetaljer skal få status 500 når feil i backend", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/meldekort/1707156949`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    );

    const response = await catchErrorResponse(() => hentMeldekortdetaljer("", meldekortId));

    expect(response.status).toBe(500);
    expect(response.statusText).toBe("Internal Server Error");
  });

  test("hentMeldekortdetaljer skal få data", async () => {
    const expectedData = { ...TEST_MELDEKORTDETALJER }; // Clone
    jsonify(expectedData);

    const response = await hentMeldekortdetaljer("", meldekortId);

    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toStrictEqual(expectedData);
  });

  test("hentMeldekortdetaljer skal få status 500 når feil i fetch", async () => {
    // Stopper server slik at fetch kaster exception
    server.close();

    const response = await catchErrorResponse(() => hentMeldekortdetaljer("", meldekortId));

    expect(response.status).toBe(500);
    expect(response.statusText).toBe("fetch failed");
  });

  // OBS! Ikke skriv andre tester her videre hvis du trenger fungerende server, den er allerede stoppet
});
