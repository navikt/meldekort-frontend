import { MetaArgs } from "react-router";
import { describe, expect, test } from "vitest";

import Index, { loader, meta } from "~/routes/_index";

import { TEST_URL } from "../helpers/setup";


describe("Index", () => {
  test("Skal få redirect til Send meldekort", async () => {
    const response = (await loader({
      unstable_pattern: "",
      request: new Request(TEST_URL),
      params: {},
      context: {},
    })) as Response;

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe("/send-meldekort");
  });

  test("Skal vise tom div", async () => {
    expect(Index()).toStrictEqual(<div></div>);
  });

  test("Skal returnere metainformasjon", async () => {
    const args = {} as MetaArgs;

    expect(meta(args)).toStrictEqual([
      { title: "Meldekort" },
      { name: "description", content: "Meldekort" },
    ]);
  });
});
