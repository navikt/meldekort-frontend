import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "../mocks/server";
import { cleanup, render } from "@testing-library/react";
import { createRemixStub } from "@remix-run/testing";
import type { LoaderFunction } from "@remix-run/node";
import * as React from "react";


export const beforeAndAfterSetup = () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
  afterAll(() => server.close())
  afterEach(() => {
    server.resetHandlers()
    cleanup()
  })
}

export const renderRemixStub = (
  component: React.ComponentType,
  loader?: LoaderFunction,
  nextPath?: string,
  nextComponent?: React.ComponentType
) => {
  const RemixStub = createRemixStub([
    {
      path: "/",
      Component: component,
      loader
    },
    {
      path: nextPath,
      Component: nextComponent
    }
  ])

  render(<RemixStub />)
}
