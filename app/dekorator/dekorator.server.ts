import { type DecoratorEnvProps, type DecoratorFetchProps } from "@navikt/nav-dekoratoren-moduler/ssr";
import { fetchDecoratorHtml } from "@navikt/nav-dekoratoren-moduler/ssr/index.js";
import { getEnv } from "~/utils/envUtils";


export async function hentDekoratorHtml() {

  const config: DecoratorFetchProps = {
    env: (getEnv("DEKORATOR_MILJO") ?? "localhost") as DecoratorEnvProps["env"],
    localUrl: "http://localhost:8080/dekorator",
    serviceDiscovery: false,
    params: {
      simple: false,
      feedback: false,
      chatbot: false,
      shareScreen: true,
      enforceLogin: false,
      logoutWarning: true,
    },
  };

  return await fetchDecoratorHtml(config);
}
