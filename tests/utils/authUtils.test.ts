import { describe, expect, test, vi } from "vitest";
import { FALLBACK_TOKEN, getOboToken } from "~/utils/authUtils";
import { catchErrorResponse } from "../helpers/response-helper";


describe("Auth utils", () => {
  vi.mock("@navikt/oasis", () => {
    vi.stubGlobal("window", undefined);
    vi.stubEnv("IS_LOCALHOST", "false");

    return {
      getToken: (request: Request) => {
        if (request.url === "http://uten.token/") {
          return null;
        }

        if (request.url === "http://med.invalid.token/") {
          return "INVALID_TOKEN";
        }

        if (request.url === "http://med.valid.token.uten.tokenx/") {
          return "VALID_TOKEN_UTEN_TOKENX";
        }

        return "VALID_TOKEN_MED_TOKENX";
      },
      validateIdportenToken: (token: string) => {
        if (token === "INVALID_TOKEN") {
          return { ok: false };
        }

        return { ok: true };
      },
      requestTokenxOboToken: (token: string) => {
        if (token === "VALID_TOKEN_UTEN_TOKENX") {
          return { ok: false, token: "" };
        }

        return { ok: true, token: "API TOKEN" };
      },
    };
  });

  test("getOboToken skal returnere FALLBACK_TOKEN på localhost uten MELDEKORT_API_TOKEN", async () => {
    vi.stubEnv("IS_LOCALHOST", "true");

    const result = await getOboToken(new Request("http://localhost/"));
    expect(result).toBe(FALLBACK_TOKEN);
  });

  test("getOboToken skal returnere MELDEKORT_API_TOKEN på localhost med MELDEKORT_API_TOKEN", async () => {
    vi.stubEnv("IS_LOCALHOST", "true");
    vi.stubEnv("MELDEKORT_API_TOKEN", "testToken");

    const result = await getOboToken(new Request("http://localhost/"));
    expect(result).toBe("testToken");
  });

  test("getOboToken skal returnere feil når ikke kan hente token fra Request", async () => {
    vi.stubEnv("IS_LOCALHOST", "false");

    const result = await catchErrorResponse(() =>
      getOboToken(new Request("http://uten.token/"))
    );
    expect(result.status).toBe(500);
    expect(result.statusText).toBe("Feil ved henting av token fra request");
  });

  test("getOboToken skal returnere feil når ikke kan validere token fra request", async () => {
    vi.stubEnv("IS_LOCALHOST", "false");

    const result = await catchErrorResponse(() =>
      getOboToken(new Request("http://med.invalid.token/"))
    );
    expect(result.status).toBe(500);
    expect(result.statusText).toBe("Feil ved validering av token");
  });

  test("getOboToken skal returnere feil når ikke kan hente TokenX OboToken", async () => {
    vi.stubEnv("IS_LOCALHOST", "false");

    const result = await catchErrorResponse(() =>
      getOboToken(new Request("http://med.valid.token.uten.tokenx/"))
    );
    expect(result.status).toBe(500);
    expect(result.statusText).toBe("Feil ved henting  av obo token");
  });

  test("getOboToken skal returnere API token", async () => {
    vi.stubEnv("IS_LOCALHOST", "false");

    const token = await getOboToken(new Request("http://localhost/"));
    expect(token).toBe("API TOKEN");
  });
});
