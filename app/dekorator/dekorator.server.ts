import { type DecoratorFetchProps } from "@navikt/nav-dekoratoren-moduler/ssr";
import { fetchDecoratorHtml } from "@navikt/nav-dekoratoren-moduler/ssr/index.js";

export async function hentDekoratorHtml() {

  const config: DecoratorFetchProps = {
    env: process.env.DEKORATOR_MILJO ?? "localhost",
    localUrl: "https://dekoratoren.ekstern.dev.nav.no",
    params: {
      simple: false,
      feedback: false,
      chatbot: false,
      shareScreen: true,
      logoutWarning: true,
    },
  };

  return await fetchDecoratorHtml(config);
}
