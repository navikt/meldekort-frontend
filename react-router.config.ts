import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  basename: "/meldekort",
  routeDiscovery: {
    mode: "lazy",
    manifestPath: "/meldekort"
  }
} satisfies Config;
