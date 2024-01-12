import { type DecoratorEnvProps, type DecoratorFetchProps } from "@navikt/nav-dekoratoren-moduler/ssr";
import { fetchDecoratorHtml } from "@navikt/nav-dekoratoren-moduler/ssr/index.js";

export async function hentDekoratorHtml() {

  const config: DecoratorFetchProps = {
    env: (process.env.DEKORATOR_MILJO ?? "localhost") as DecoratorEnvProps["env"],
    localUrl: "http://localhost:4000/dekorator",
    params: {
      simple: false,
      feedback: false,
      chatbot: false,
      shareScreen: true,
      enforceLogin: true,
      logoutWarning: true,
    },
  };

  return await fetchDecoratorHtml(config);
}
