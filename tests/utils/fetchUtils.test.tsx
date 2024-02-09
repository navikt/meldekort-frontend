import { describe, expect, expectTypeOf, test } from "vitest";
import { getHeaders, useFetcherWithPromise } from "~/utils/fetchUtils";
import type { ISendInnMeldekortActionResponse } from "~/models/meldekortdetaljerInnsending";
import type { FetcherWithComponents, SubmitFunction } from "@remix-run/react";
import { render } from "@testing-library/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import type { SerializeFrom } from "@remix-run/node";

describe("Fetch utils", () => {
  test("getHeaders skal returnere riktige headerd", async () => {
    const token = "TOKEN"
    const result = getHeaders(token)
    expect(result).toStrictEqual({
      "Accept": "application/json",
      "Content-Type": "application/json",
      "TokenXAuthorization": `Bearer ${token}`
    })
  })

  test("useFetcherWithPromise skal returnere fetcher med promise", async () => {
    let fetcher: FetcherWithComponents<SerializeFrom<ISendInnMeldekortActionResponse>>

    const TestComponent = () => {
      fetcher = useFetcherWithPromise<ISendInnMeldekortActionResponse>({ key: "TEST" })

      return (
        <fetcher.Form>
          Test
        </fetcher.Form>
      );
    };

    const testRouter = createBrowserRouter([
      {
        path: "/",
        element: <TestComponent />
      }
    ]);

    render(<RouterProvider router={testRouter} />)

    // Sjekker typer
    // @ts-ignore
    expectTypeOf(fetcher as FetcherWithComponents<SerializeFrom<ISendInnMeldekortActionResponse>>).toBeObject()
    // @ts-ignore
    expectTypeOf(fetcher.submit).toBeFunction()
    // @ts-ignore
    expectTypeOf(fetcher.submit).parameters.toMatchTypeOf<Parameters<SubmitFunction>>()
    // @ts-ignore
    expectTypeOf(fetcher.submit).returns.toMatchTypeOf<Promise<ISendInnMeldekortActionResponse | undefined>>()

    // Prøver å bruke submit og Promise
    const formData = new FormData()
    formData.append("meldekortdetaljer", "{}")
    // @ts-ignore
    fetcher.submit(formData, { method: "post" }).then((data) => {
      console.log(data)
    }).catch(() => {
    })
  })
})
