import type { ServerRuntimeMetaArgs } from "@remix-run/server-runtime/dist/routeModules";
import { describe, expect, test } from "vitest";

import Index, { loader, meta } from "~/routes/_index";

import { catchErrorResponse } from "../helpers/response-helper";
import { TEST_URL } from "../helpers/setup";


describe("Index", () => {
  test("Skal få redirect til Send meldekort", async () => {
    const response = await catchErrorResponse(() =>
      loader({
        request: new Request(TEST_URL),
        params: {},
        context: {},
      }),
    );

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe("/send-meldekort");
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
