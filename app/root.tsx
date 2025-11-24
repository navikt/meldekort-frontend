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
import { hentPerson, IPerson } from "~/models/person";
import type { IPersonStatus } from "~/models/personStatus";
import { hentPersonStatus } from "~/models/personStatus";
import { hentHarAAP } from "~/utils/aapUtils";
import { getOboToken } from "~/utils/authUtils";
import { hentHarDP } from "~/utils/dpUtils";
import { getEnv } from "~/utils/envUtils";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";
import { hentTpBruker, ITPBruker } from "~/utils/tpUtils";
import { Umami } from "~/utils/umamiUtils";

import { useInjectDecoratorScript } from "./utils/dekoratorUtils";

export interface IRootLoaderData {
  fragments: DecoratorElements;
  feil: boolean;
  env: {
    BASE_PATH: string;
    MIN_SIDE_URL: string;
    UMAMI_ID: string;
    SKAL_LOGGE: string;
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
  let personStatus: IPersonStatus | null = null;

  const meldekortApiOBOToken = await getOboToken(request);

  const url = new URL(request.url);
  // Sjekk at denne personen har tilgang (dvs. har meldeplikt)
  const personStatusResponse = await hentPersonStatus(meldekortApiOBOToken);
  if (personStatusResponse.ok) {
    personStatus = await personStatusResponse.json();
  }

  if (personStatus == null) {
    feil = true;
  } else {
    let antallMeldekort = 0;

    // Sjekk at personen har meldekort i Arena med meldegrupper som ikke er ARBS og DAGP
    // Dette sjekker vi fordi ALLE ARBS og DAGP meldekort KAN (og må) sendes gjennom den nye dp-løsningen
    // Det er ingen vits i å sjekke antall meldekort i Arena når vi har tom id i personStatus (dvs. ingen meldeplikt i Arena)
    if (personStatus.id !== "") {
      const personResponse = await hentPerson(meldekortApiOBOToken);
      const person = await personResponse.json() as IPerson;
      antallMeldekort =
        person.meldekort.filter(meldekort => meldekort.meldegruppe !== "ARBS" && meldekort.meldegruppe !== "DAGP").length +
        person.etterregistrerteMeldekort.filter(meldekort => meldekort.meldegruppe !== "ARBS" && meldekort.meldegruppe !== "DAGP").length;
    }

    // Fortsett i felles løsningen hvis det finnes noe
    // Hvis det ikke finnes noe, sjekk om personen skal sendes til DP, AAP eller TP
    if (antallMeldekort === 0) {
      // Sjekk at denne personen skal sendes til den nye DP løsningen
      // Redirect til DP ellers fortsett
      const harDPResponse = await hentHarDP(meldekortApiOBOToken);
      if (harDPResponse.status === 307) {
        return redirect(getEnv("DP_URL"), 307);
      } else if (!harDPResponse.ok) {
        feil = true;
      }

      // Sjekk at denne personen skal sendes til den nye AAP løsningen
      // Redirect til AAP ellers fortsett
      const aapApiOBOToken = await getOboToken(request, getEnv("AAP_API_AUDIENCE"));
      const harAAPResponse = await hentHarAAP(aapApiOBOToken);
      if (harAAPResponse.status === 200) {
        const harAapBody = await harAAPResponse.text();
        if (harAapBody === '"AAP"') {  // Returneres fra API med sitattegn
          return redirect(getEnv("AAP_URL"), 307);
        }
      } else {
        feil = false;
      }

      // Sjekk at denne personen skal sendes til den nye TP løsningen
      // Redirect til TP ellers fortsett
      const tpApiOBOToken = await getOboToken(request, getEnv("TP_API_AUDIENCE"));
      const tpBrukerResponse = await hentTpBruker(tpApiOBOToken);
      if (tpBrukerResponse.status === 200) {
        const tpBruker: ITPBruker = await tpBrukerResponse.json();
        if (tpBruker.harSak) {
          return redirect(getEnv("TP_URL"), 307);
        }
      } else {
        feil = false;
      }
    }

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

  return {
    fragments,
    feil,
    env: {
      BASE_PATH: getEnv("BASE_PATH"),
      MIN_SIDE_URL: getEnv("MIN_SIDE_URL"),
      UMAMI_ID: getEnv("UMAMI_ID"),
      SKAL_LOGGE: getEnv("SKAL_LOGGE"),
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
    const alert = <Alert variant="error">{parseHtml(tt("feilmelding.baksystem"))} !!</Alert>;

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
        <Umami />
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
