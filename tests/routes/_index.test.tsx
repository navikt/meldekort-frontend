import { describe, expect, test, vi } from "vitest";
import { catchErrorResponse } from "../helpers/response-helper";
import Index, { loader, meta } from "~/routes/_index";
import { TEST_URL } from "../helpers/setup";
import type { ServerRuntimeMetaArgs } from "@remix-run/server-runtime/dist/routeModules";


describe("Index", () => {
  test("Skal få redirect til Send meldekort", async () => {
    vi.stubEnv("BASE_PATH", "/meldekort");

    const response = await catchErrorResponse(() =>
      loader({
        request: new Request(TEST_URL),
        params: {},
        context: {},
      }),
    );

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe("/meldekort");
  });

  test("Skal vise tom div", async () => {
    expect(Index()).toStrictEqual(<div></div>);
  });

  test("Skal returnere metainformasjon", async () => {
    const args = {} as ServerRuntimeMetaArgs;

    expect(meta(args)).toStrictEqual([
      { title: "Meldekort" },
      { name: "description", content: "Meldekort" },
    ]);
  });
});
