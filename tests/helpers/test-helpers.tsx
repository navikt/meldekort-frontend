import { cleanup, render } from "@testing-library/react";
import * as React from "react";
import type { LoaderFunction } from "react-router";
import { createRoutesStub } from "react-router";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";

import { server } from "../mocks/server";


export const beforeAndAfterSetup = () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
  beforeEach(() => {
    vi.stubEnv("IS_LOCALHOST", "true");
  });
  afterEach(() => {
    server.resetHandlers();
    cleanup();
  });
  afterAll(() => server.close());
};

export const renderRoutesStub = (
  component: React.ComponentType,
  loader?: LoaderFunction,
  nextPath?: string,
  nextComponent?: React.ComponentType,
) => {
  const RoutesStub = createRoutesStub([
    {
      path: "/",
      Component: component,
      loader,
    },
    {
      path: nextPath,
      Component: nextComponent,
    },
  ]);

  render(<RoutesStub />);
};
