import {
  type DecoratorEnvProps,
  type DecoratorFetchProps,
  fetchDecoratorHtml
} from "@navikt/nav-dekoratoren-moduler/ssr";
import { getEnv } from "~/utils/envUtils";


export async function hentDekoratorHtml() {

  const config: DecoratorFetchProps = {
    env: (getEnv("DEKORATOR_MILJO") || "localhost") as DecoratorEnvProps["env"],
    localUrl: "http://localhost:8080/dekorator",
    serviceDiscovery: true,
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
