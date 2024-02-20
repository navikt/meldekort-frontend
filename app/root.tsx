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
import { getEnv } from "~/utils/envUtils";

import navStyles from "@navikt/ds-css/dist/index.css";
import indexStyle from "~/index.css";
import { useEffect, useRef } from "react";


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
      MIN_SIDE_URL: getEnv("MIN_SIDE_URL"),
      AMPLITUDE_API_KEY: getEnv("AMPLITUDE_API_KEY")
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

    if (skrivemodus && !skrivemodus.skrivemodus) {
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

  useInjectDecoratorScript(fragments.DECORATOR_SCRIPTS);

  return (
    <html lang={locale} dir={i18n.dir()}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        {parse(fragments.DECORATOR_STYLES, { trim: true })}
        {/* Ikke legg parsing av dekoratør-html i egne komponenter. Det trigger rehydrering,
            som gjør at grensesnittet flimrer og alle assets lastes på nytt siden de har så mange side effects.
            Løsningen enn så lenge er å inline parsingen av HTML her i root.
         */}
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

/*
 * Injiser script-elementet til dekoratøren og en tilhørende div.
 * useEffect()-hooken sørger for at dette gjøres utelukkende client-side, ellers vil dekoratøren manipulere DOM-en og forstyrre hydreringen.
 */
const useInjectDecoratorScript = (script?: string) => {
  const isInjected = useRef(false);

  useEffect(() => {
    if (script && !isInjected.current) {
      const parser = new DOMParser();
      const parsedDocument = parser.parseFromString(script, "text/html");

      const parsedElements = Array.from(parsedDocument.body.childNodes);
      const parsedDivElement = parsedElements[0] as HTMLDivElement;
      const parsedScriptElement = parsedElements[2] as HTMLScriptElement;

      const divElement = createElementWithAttributes("div", parsedDivElement.attributes);
      const scriptElement = createElementWithAttributes(
        "script",
        parsedScriptElement.attributes
      );

      document.body.appendChild(divElement);
      document.body.appendChild(scriptElement);

      isInjected.current = true;
    }
  }, [script]);
}

const createElementWithAttributes = (tag: string, attributes: NamedNodeMap) => {
  const element = document.createElement(tag);

  for (let i = 0; i < attributes.length; i++) {
    element.setAttribute(attributes[i].name, attributes[i].value);
  }

  return element;
}
