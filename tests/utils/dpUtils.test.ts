import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { hentHarDP } from "~/utils/dpUtils";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";
import { TEST_MELDEKORT_API_URL } from "../helpers/setup";
import { catchErrorResponse } from "../helpers/response-helper";


describe("Misc utils", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  test("hentHarDP skal få status 500 når feil i backend", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/hardp`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true },
      ),
    );

    const response = await catchErrorResponse(() => hentHarDP(""));

    expect(response.status).toBe(500);
    expect(response.statusText).toBe("Internal Server Error");
  });

  test("hentHarDP skal returnere 200 når ikke har DP", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/hardp`,
        () => new HttpResponse(null, { status: 200 }),
        { once: true },
      ),
    );

    const response = await hentHarDP("");
    expect(response.status).toBe(200);
  });

  test("hentHarDP skal returnere 307 når har DP", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/hardp`,
        () => new HttpResponse(null, { status: 307 }),
        { once: true },
      ),
    );

    const response = await hentHarDP("");
    expect(response.status).toBe(307);
  });

  test("hentHarDP skal få status 500 når feil i fetch", async () => {
    // Stopper server slik at fetch kaster exception
    server.close();

    const response = await catchErrorResponse(() => hentHarDP(""));

    expect(response.status).toBe(500);
    expect(response.statusText).toBe("fetch failed");
  });
});
