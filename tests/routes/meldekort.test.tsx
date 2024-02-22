import { describe, expect, test } from "vitest";
import { catchErrorResponse } from "../helpers/response-helper";
import Meldekort, { loader, meta } from "~/routes/meldekort";
import { TEST_URL } from "../helpers/setup";
import type { ServerRuntimeMetaArgs } from "@remix-run/server-runtime/dist/routeModules";


describe("Meldekort", () => {
  test("Skal få redirect til root", async () => {
    const response = await catchErrorResponse(() =>
      loader({
        request: new Request(TEST_URL + "/meldekort"),
        params: {},
        context: {}
      })
    );

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe("/");
  });

  test("Skal vise tom div", async () => {
    expect(Meldekort()).toStrictEqual(<div></div>);
  });

  test("Skal returnere metainformasjon", async () => {
    const args = {} as ServerRuntimeMetaArgs;

    expect(meta(args)).toStrictEqual([
      { title: "Meldekort" },
      { name: "description", content: "Meldekort" }
    ]);
  });
});
