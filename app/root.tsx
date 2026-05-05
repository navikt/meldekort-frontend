import "@navikt/ds-css/dist/index.css";
import "~/index.css";

import { Alert } from "@navikt/ds-react";
import { DecoratorElements } from "@navikt/nav-dekoratoren-moduler/ssr";
import parse from "html-react-parser";
import { LinksFunction, LoaderFunctionArgs } from "react-router";
import { Links, Meta, Outlet, redirect, Scripts, ScrollRestoration, useLoaderData } from "react-router";

import LoaderMedPadding from "~/components/LoaderMedPadding";
import MeldekortHeader from "~/components/meldekortHeader/MeldekortHeader";
import Sideinnhold from "~/components/sideinnhold/Sideinnhold";
import { hentDekoratorHtml } from "~/dekorator/dekorator.server";
import { hentPerson } from "~/models/person";
import { getOboToken } from "~/utils/authUtils";
import { getEnv } from "~/utils/envUtils";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";

import { useInjectDecoratorScript } from "./utils/dekoratorUtils";

export interface IRootLoaderData {
  fragments: DecoratorElements;
  feil: boolean;
  env: {
    BASE_PATH: string;
    MIN_SIDE_URL: string;
  };
}

export const links: LinksFunction = () => {
  return [
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: `${getEnv("BASE_PATH")}/favicon-32x32.png`,
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: `${getEnv("BASE_PATH")}/favicon-16x16.png`,
        },
        {
          rel: "icon",
          type: "image/x-icon",
          href: `${getEnv("BASE_PATH")}/favicon.ico`,
        },
  ];
};

export async function loader({ request }: LoaderFunctionArgs): Promise<Response | IRootLoaderData> {
  let feil = false;

  const meldekortApiOBOToken = await getOboToken(request);

  const url = new URL(request.url);
  const personResponse = await hentPerson(meldekortApiOBOToken);
  if (!personResponse.ok) {
    feil = true;
  } else {
    // Hvis vi er på ikke-tilgang og bruker har tilgang, redirect til send-meldekort
    if (url.pathname.endsWith("/ikke-tilgang") && personResponse.status === 200) {
      return redirect("/send-meldekort", 307);
    }

    // Hvis vi ikke er på ikke-tilgang og bruker ikke har tilgang, redirect til ikke-tilgang
    if (!url.pathname.endsWith("/ikke-tilgang") && personResponse.status === 204) {
      return redirect("/ikke-tilgang", 307);
    }
  }

  const fragments = await hentDekoratorHtml();

  return {
    fragments,
    feil,
    env: {
      BASE_PATH: getEnv("BASE_PATH"),
      MIN_SIDE_URL: getEnv("MIN_SIDE_URL"),
    },
  };
}

export default function App() {

  const { fragments, feil, env } = useLoaderData<typeof loader>();

  const { i18n, tt } = useExtendedTranslation();

  let innhold = <Outlet />;

  // Sjekk at vi allerede har tekster, ellers vis loader
  if (!i18n.hasLoadedNamespace("1000-01-01")) {
    innhold = <LoaderMedPadding />;
  }

  if (feil) {
    // Hvis det er feil, vis feilmelding
    // Ellers vis Outlet
    const alert = <Alert variant="error">{parseHtml(tt("feilmelding.baksystem"))}</Alert>;

    innhold = <div>
      <MeldekortHeader />
      <Sideinnhold utenSideoverskrift={true} innhold={alert} />
    </div>;
  }

  useInjectDecoratorScript(fragments.DECORATOR_SCRIPTS);

  return (
    <html lang={ i18n.language }>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        {parse(fragments.DECORATOR_HEAD_ASSETS, { trim: true })}
        <Links />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `window.env = ${JSON.stringify(env)}` }} />
        {parse(fragments.DECORATOR_HEADER, { trim: true })}
        {innhold}
        {parse(fragments.DECORATOR_FOOTER, { trim: true })}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const { i18n } = useExtendedTranslation();

  const alert = <Alert variant="error">Feil i baksystem / System error</Alert>;

  return (
    <html lang={ i18n.language }>
      <head>
        <title>Meldekort</title>
        <Meta />
        <Links />
      </head>
      <body>
        <Sideinnhold utenSideoverskrift={true} innhold={alert} />
        <Scripts />
      </body>
    </html>
  );
}
