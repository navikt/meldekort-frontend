import { setupServer } from "msw/node";

import { handlers } from "./handlers";


export const server = setupServer(...handlers);

export const setup = () => setupServer(...handlers);

export const start = (server: ReturnType<typeof setup>) => {
  server.listen({ onUnhandledFrame: "bypass" });

  process.once("SIGINT", () => server.close());
  process.once("SIGTERM", () => server.close());

  console.info("🔶 Mock server");
};
