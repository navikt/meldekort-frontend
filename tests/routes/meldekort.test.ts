import { describe, expect, test } from 'vitest'
import { catchErrorResponse } from "../helpers/response-helper";
import { loader } from "~/routes/meldekort";
import { TEST_URL } from "../helpers/setup";


describe("Hovedside", () => {
  test("Skal få redirect til Send meldekort", async () => {
    const response = await catchErrorResponse(() =>
      loader({
        request: new Request(TEST_URL + "/meldekort"),
        params: {},
        context: {}
      })
    )

    expect(response.status).toBe(301)
    expect(response.headers.get("location")).toBe("/")
  });
});
