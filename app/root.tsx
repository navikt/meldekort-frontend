import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import { hentDekoratorHtml } from "~/dekorator/dekorator.server";
import parse from "html-react-parser";
import { Alert } from "@navikt/ds-react";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";
import MeldekortHeader from "~/components/meldekortHeader/MeldekortHeader";
import Sideinnhold from "~/components/sideinnhold/Sideinnhold";
import { getOboToken } from "~/utils/authUtils";
import { getEnv } from "~/utils/envUtils";
import type { IPersonStatus } from "~/models/personStatus";
import { hentPersonStatus } from "~/models/personStatus";
import { hentHarDP } from "~/utils/dpUtils";
import { useInjectDecoratorScript } from "./utils/dekoratorUtils";
import LoaderMedPadding from "~/components/LoaderMedPadding";

import "@navikt/ds-css/dist/index.css";
import "~/index.css";


export const links: LinksFunction = () => {
  return [
    ...(cssBundleHref
      ? [
        { rel: "stylesheet", href: cssBundleHref },
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
      ]
      : []),
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  let feil = false;
  let personStatus: IPersonStatus | null = null;

  const onBehalfOfToken = await getOboToken(request);

  // Sjekk at denne personen skal sendes til den nye DP løsningen
  // Redirect til DP ellers fortsett
  const harDPResponse = await hentHarDP(onBehalfOfToken);
  if (harDPResponse.status === 307) {
    return redirect(getEnv("DP_URL"), 307);
  }

  const url = new URL(request.url);
  // Sjekk at denne personen har tilgang (dvs. har meldeplikt)
  const personStatusResponse = await hentPersonStatus(onBehalfOfToken);
  if (personStatusResponse.ok) {
    personStatus = await personStatusResponse.json();
  }

  if (personStatus == null) {
    feil = true;
  } else {
    // Hvis vi er på ikke-tilgang og bruker har tilgang, redirect til send-meldekort
    if (url.pathname.endsWith("/ikke-tilgang") && personStatus.id !== "") {
      return redirect("/send-meldekort", 307);
    }

    // Hvis vi ikke er på ikke-tilgang og bruker ikke har tilgang, redirect til ikke-tilgang
    if (!url.pathname.endsWith("/ikke-tilgang") && personStatus.id === "") {
      return redirect("/ikke-tilgang", 307);
    }
  }

  const fragments = await hentDekoratorHtml();

  if (!harDPResponse.ok) {
    feil = true;
  }

  return json({
    fragments,
    feil,
    env: {
      BASE_PATH: getEnv("BASE_PATH"),
      MIN_SIDE_URL: getEnv("MIN_SIDE_URL"),
      AMPLITUDE_API_KEY: getEnv("AMPLITUDE_API_KEY"),
    },
  });
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
    let alert = <Alert variant="error">{parseHtml(tt("feilmelding.baksystem"))}</Alert>;

    innhold = <div>
      <MeldekortHeader />
      <Sideinnhold utenSideoverskrift={true} innhold={alert} />
    </div>;
  }

  useInjectDecoratorScript(fragments.DECORATOR_SCRIPTS);

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        {parse(fragments.DECORATOR_STYLES, { trim: true })}
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
  const alert = <Alert variant="error">Feil i baksystem / System error</Alert>;

  return (
    <html>
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
