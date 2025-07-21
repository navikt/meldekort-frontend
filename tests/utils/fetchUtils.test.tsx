import type { FetcherWithComponents, SubmitFunction } from "react-router";
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, expectTypeOf, test } from "vitest";

import type { ISendInnMeldekortActionResponse } from "~/models/meldekortdetaljerInnsending";
import { getHeaders, useFetcherWithPromise } from "~/utils/fetchUtils";


describe("Fetch utils", () => {
  test("getHeaders skal returnere riktige headerd", async () => {
    const token = "TOKEN";
    const result = getHeaders(token);
    expect(result).toStrictEqual({
      "Accept": "application/json",
      "Content-Type": "application/json",
      "TokenXAuthorization": `Bearer ${token}`,
    });
  });

  test("useFetcherWithPromise skal returnere fetcher med promise", async () => {
    let fetcher: FetcherWithComponents<SerializeFrom<ISendInnMeldekortActionResponse>>;

    const TestComponent = () => {
      fetcher = useFetcherWithPromise<ISendInnMeldekortActionResponse>({ key: "TEST" });

      return (
        <fetcher.Form>
          Test
        </fetcher.Form>
      );
    };

    const testRouter = createMemoryRouter([
      {
        path: "/",
        element: <TestComponent />,
        action: async (args: never) => {
          return args;
        },
      },
    ]);

    render(<RouterProvider router={testRouter} />);

    // Sjekker typer
    expectTypeOf(fetcher as FetcherWithComponents<SerializeFrom<ISendInnMeldekortActionResponse>>).toBeObject();
    expectTypeOf(fetcher.submit).toBeFunction();
    expectTypeOf(fetcher.submit).parameters.toMatchTypeOf<Parameters<SubmitFunction>>();
    expectTypeOf(fetcher.submit).returns.toMatchTypeOf<Promise<ISendInnMeldekortActionResponse | undefined>>();

    // Prøver å bruke submit og Promise
    const formData = new FormData();
    formData.append("meldekortdetaljer", "{}");
    fetcher.submit(formData, { method: "post" }).then((data) => {
      console.trace(data);
    }).catch(() => {
    });
  });
});
