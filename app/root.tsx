import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import { hentDekoratorHtml } from "~/dekorator/dekorator.server";
import parse from "html-react-parser";
import i18next from "~/i18next.server";
import { useChangeLanguage } from "remix-i18next";
import type { ISkrivemodus } from "~/models/skrivemodus";
import { hentSkrivemodus } from "~/models/skrivemodus";
import { Alert } from "@navikt/ds-react";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";
import MeldekortHeader from "~/components/meldekortHeader/MeldekortHeader";
import Sideinnhold from "~/components/sideinnhold/Sideinnhold";
import { getOboToken } from "~/utils/authUtils";
import { getEnv } from "~/utils/envUtils";
import type { IPersonStatus } from "~/models/personStatus";
import { hentPersonStatus } from "~/models/personStatus";
import { hentErViggo } from "~/utils/viggoUtils";
import { useInjectDecoratorScript } from "./utils/dekoratorUtils";
import LoaderMedPadding from "~/components/LoaderMedPadding";

import navStyles from "@navikt/ds-css/dist/index.css";
import indexStyle from "~/index.css";


export const links: LinksFunction = () => {
  return [
    ...(cssBundleHref
      ? [
        { rel: "stylesheet", href: navStyles },
        { rel: "stylesheet", href: cssBundleHref },
        { rel: "stylesheet", href: indexStyle },
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
  let skrivemodus: ISkrivemodus | null = null;

  const onBehalfOfToken = await getOboToken(request);

  // Sjekk at denne personen skal sendes til den nye DP løsningen
  // Redirect til DP ellers fortsett
  const erViggoResponse = await hentErViggo(onBehalfOfToken);
  if (erViggoResponse.status === 307) {
    return redirect(getEnv("DP_URL"), 307);
  }

  const url = new URL(request.url);
  // Sjekk at denne personen har tilgang (dvs. har meldeplikt)
  const personStatusResponse = await hentPersonStatus(onBehalfOfToken);
  if (personStatusResponse.ok) {
    personStatus = await personStatusResponse.json();
  }

  // Hvis vi er på ikke-tilgang og bruker har tilgang, redirect til send-meldekort
  if (url.pathname.endsWith("/ikke-tilgang") && personStatus?.id !== "") {
    return redirect(`${getEnv("BASE_PATH")}/send-meldekort`, 307);
  }

  // Hvis vi ikke er på ikke-tilgang og bruker ikke har tilgang, redirect til ikke-tilgang
  if (!url.pathname.endsWith("/ikke-tilgang") && (!personStatus || personStatus.id === "")) {
    return redirect(`${getEnv("BASE_PATH")}/ikke-tilgang`, 307);
  }

  const fragments = await hentDekoratorHtml();
  const locale = await i18next.getLocale(request);
  const skrivemodusResponse = await hentSkrivemodus(onBehalfOfToken);

  if (!erViggoResponse.ok || !skrivemodusResponse.ok) {
    feil = true;
  } else {
    skrivemodus = await skrivemodusResponse.json();
  }

  return json({
    fragments,
    locale,
    feil,
    skrivemodus,
    env: {
      BASE_PATH: getEnv("BASE_PATH"),
      MIN_SIDE_URL: getEnv("MIN_SIDE_URL"),
      AMPLITUDE_API_KEY: getEnv("AMPLITUDE_API_KEY"),
    },
  });
}

export default function App() {

  const { fragments, locale, feil, skrivemodus, env } = useLoaderData<typeof loader>();

  const { i18n, tt } = useExtendedTranslation();

  // This hook will change the i18n instance language to the current locale detected by the loader
  useChangeLanguage(locale);

  let innhold = <Outlet />;

  // Sjekk at vi allerede har tekster, ellers vis loader
  if (!i18n.hasLoadedNamespace("1000-01-01")) {
    innhold = <LoaderMedPadding />;
  }

  if (feil || skrivemodus?.skrivemodus !== true) {
    // Hvis det er feil, vis feilmelding
    // Hvis skrivemodus er hentet men ikke er true, vis infomelding
    // Ellers vis Outlet
    let alert = <Alert variant="error">{parseHtml(tt("feilmelding.baksystem"))}</Alert>;

    if (skrivemodus && !skrivemodus.skrivemodus) {
      // Hvis skrivemodues ikke er true:
      // Hvis det finnes infomelding i Skrivemodus, vis denne meldingen
      // Ellers vis standard melding
      let melding = tt("skrivemodusInfomelding");
      if (skrivemodus.melding) {
        melding = i18n.language === "nb" ? skrivemodus.melding.norsk : skrivemodus.melding.engelsk;
      }

      alert = <Alert variant="info">{parseHtml(melding)}</Alert>;
    }

    innhold = <div>
      <MeldekortHeader />
      <Sideinnhold utenSideoverskrift={true} innhold={alert} />
    </div>;
  }

  useInjectDecoratorScript(fragments.DECORATOR_SCRIPTS);

  return (
    <html lang={locale} dir={i18n.dir()}>
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
        <LiveReload />
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
