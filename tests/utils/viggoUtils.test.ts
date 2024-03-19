import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { hentErViggo } from "~/utils/viggoUtils";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";
import { TEST_MELDEKORT_API_URL } from "../helpers/setup";
import { catchErrorResponse } from "../helpers/response-helper";


describe("Misc utils", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  test("hentErViggo skal få status 500 når feil i backend", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/viggo/erViggo`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true },
      ),
    );

    const response = await catchErrorResponse(() => hentErViggo(""));

    expect(response.status).toBe(500);
    expect(response.statusText).toBe("Internal Server Error");
  });

  test("hentErViggo skal returnere 200 når ikke Viggo", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/viggo/erViggo`,
        () => new HttpResponse(null, { status: 200 }),
        { once: true },
      ),
    );

    const response = await hentErViggo("");
    expect(response.status).toBe(200);
  });

  test("hentErViggo skal returnere 307 når ikke Viggo", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/viggo/erViggo`,
        () => new HttpResponse(null, { status: 307 }),
        { once: true },
      ),
    );

    const response = await hentErViggo("");
    expect(response.status).toBe(307);
  });

  test("hentErViggo skal få status 500 når feil i fetch", async () => {
    // Stopper server slik at fetch kaster exception
    server.close();

    const response = await catchErrorResponse(() => hentErViggo(""));

    expect(response.status).toBe(500);
    expect(response.statusText).toBe("fetch failed");
  });
});
