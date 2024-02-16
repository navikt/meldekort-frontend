import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
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
          href: "/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/favicon-16x16.png",
        },
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon.ico",
        },
      ]
      : []),
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  let feil = false;
  let skrivemodus: ISkrivemodus | null = null;

  const onBehalfOfToken = await getOboToken(request);

  const fragments = await hentDekoratorHtml();
  const locale = await i18next.getLocale(request);
  const skrivemodusResponse = await hentSkrivemodus(onBehalfOfToken);

  if (!skrivemodusResponse.ok) {
    feil = true
  } else {
    skrivemodus = await skrivemodusResponse.json();
  }

  return json({
    fragments,
    locale,
    feil,
    skrivemodus,
    env: {
      MIN_SIDE_URL: process.env.MIN_SIDE_URL,
      AMPLITUDE_API_KEY: process.env.AMPLITUDE_API_KEY
    }
  });
}

export default function App() {

  const { fragments, locale, feil, skrivemodus, env } = useLoaderData<typeof loader>();

  const { i18n, tt } = useExtendedTranslation();

  // This hook will change the i18n instance language to the current locale detected by the loader
  useChangeLanguage(locale);

  let innhold = <Outlet />

  // Hent skrivemodus
  // Hvis det er feil, vis feilmelding
  // Hvis skrivemodus er hentet men ikke er true, vis infomelding
  // Ellers vis Outlet
  if (feil || skrivemodus?.skrivemodus !== true) {
    let alert = <Alert variant="error">{parseHtml(tt("feilmelding.baksystem"))}</Alert>

    if (skrivemodus && skrivemodus.skrivemodus !== true) {
      // Hvis skrivemodues ikke er true:
      // Hvis det finnes infomelding i Skrivemodus, vis denne meldingen
      // Ellers vis standard melding
      let melding = tt("skrivemodusInfomelding")
      if (skrivemodus.melding) {
        melding = i18n.language === "nb" ? skrivemodus.melding.norsk : skrivemodus.melding.engelsk;
      }

      alert = <Alert variant="info">{parseHtml(melding)}</Alert>
    }

    innhold = <div>
      <MeldekortHeader />
      <Sideinnhold utenSideoverskrift={true} innhold={alert} />
    </div>
  }

  return (
    <html lang={locale} dir={i18n.dir()}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        {parse(fragments.DECORATOR_STYLES)}
        <Links />
      </head>
      <body>
       <script dangerouslySetInnerHTML={{ __html: `window.env = ${JSON.stringify(env)}`}} />
       <Scripts />
        {parse(fragments.DECORATOR_HEADER)}
        {innhold}
        <ScrollRestoration />
        {parse(fragments.DECORATOR_FOOTER)}
        <Scripts />
        {parse(fragments.DECORATOR_SCRIPTS)}
        <LiveReload />
      </body>
    </html>
  );
}
