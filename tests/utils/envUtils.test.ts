import { describe, expect, test, vi } from "vitest";
import { getEnv } from "~/utils/envUtils";
import { TEST_MIN_SIDE_URL } from "../helpers/setup";


describe("Env utils", () => {
  test("getEnv skal returnere verdi fra window.env når process.env[key] er undefined", async () => {
    // window.env.MIN_SIDE_URL settes i setup.ts
    const result = getEnv("MIN_SIDE_URL");
    expect(result).toBe(TEST_MIN_SIDE_URL);
  });

  test("getEnv skal returnere verdi fra window.env når process.env[key] er tom", async () => {
    // window.env.MIN_SIDE_URL settes i setup.ts
    vi.stubEnv("MIN_SIDE_URL", "");

    const result = getEnv("MIN_SIDE_URL");
    expect(result).toBe(TEST_MIN_SIDE_URL);
  });

  test("getEnv skal returnere verdi fra process.env når window er undefined", async () => {
    vi.stubGlobal("window", undefined);
    vi.stubEnv("MELDEKORT_API_AUDIENCE", "aud");

    const result = getEnv("MELDEKORT_API_AUDIENCE");
    expect(result).toBe("aud");
  });

  test("getEnv skal returnere tom verdi hvis ikke finnes", async () => {
    const result = getEnv("DEKORATOR_MILJO");
    expect(result).toBe("");
  });
});
