import type { SetupServerApi } from "msw/node";
import { setupServer } from "msw/node";

export const server = setupServer();

export const setup = () => setupServer() as SetupServerApi;

export const start = (server: SetupServerApi) => {
  server.listen({ onUnhandledRequest: "bypass" });

  process.once("SIGINT", () => server.close());
  process.once("SIGTERM", () => server.close());

  console.info("🔶 Mock server");
};
