import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  basename: "/felles-meldekort",
  routeDiscovery: {
    mode: "lazy",
    manifestPath: "/felles-meldekort"
  }
} satisfies Config;
