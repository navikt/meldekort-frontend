import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { server } from "../mocks/server";
import { cleanup, render } from "@testing-library/react";
import { createRemixStub } from "@remix-run/testing";
import type { LoaderFunction } from "@remix-run/node";
import * as React from "react";


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

export const renderRemixStub = (
  component: React.ComponentType,
  loader?: LoaderFunction,
  nextPath?: string,
  nextComponent?: React.ComponentType,
) => {
  const RemixStub = createRemixStub([
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

  render(<RemixStub />);
};
