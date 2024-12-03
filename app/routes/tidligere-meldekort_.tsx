import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import MeldekortHeader from "~/components/meldekortHeader/MeldekortHeader";
import Sideinnhold from "~/components/sideinnhold/Sideinnhold";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";
import { Alert, BodyLong } from "@navikt/ds-react";
import type { ReactElement } from "react";
import type { IMeldekort } from "~/models/meldekort";
import { hentHistoriskeMeldekort } from "~/models/meldekort";
import { useLoaderData } from "@remix-run/react";
import { getOboToken } from "~/utils/authUtils";
import MeldekorTabell from "~/components/meldekortTabell/MeldekortTabell";
import { loggAktivitet } from "~/utils/amplitudeUtils";
import type { ISkrivemodus } from "~/models/skrivemodus";
import { hentSkrivemodus } from "~/models/skrivemodus";


export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort" },
    { name: "description", content: "Tidligere meldekort" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  let feil = false;
  let skrivemodus: ISkrivemodus | null = null;
  let historiskeMeldekort: IMeldekort[] | null = null;

  const onBehalfOfToken = await getOboToken(request);
  const skrivemodusResponse = await hentSkrivemodus(onBehalfOfToken);
  const historiskeMeldekortResponse = await hentHistoriskeMeldekort(onBehalfOfToken);

  if (!skrivemodusResponse.ok || !historiskeMeldekortResponse.ok) {
    feil = true;
  } else {
    skrivemodus = await skrivemodusResponse.json();
    historiskeMeldekort = await historiskeMeldekortResponse.json();
  }

  return { feil, skrivemodus, historiskeMeldekort };
}

export default function TidligereMeldekort() {
  const { i18n, tt } = useExtendedTranslation();

  // Hent historiske meldekort
  // Hvis det er feil, vis feilmelding
  // Hvis skrivemodus er hentet men ikke er true, vis infomelding
  // Hvis det ikke finnes historiske meldekort, vis advarselsmelding
  // Hvis historiske meldekort er hentet, vis data

  const { feil, skrivemodus, historiskeMeldekort } = useLoaderData<typeof loader>();

  let forklaring = <div>
    <BodyLong spacing>
      {parseHtml(tt("tidligereMeldekort.forklaring"))}
    </BodyLong>
    <BodyLong spacing>
      {parseHtml(tt("tidligereMeldekort.forklaring.korrigering"))}
    </BodyLong>
  </div>;

  let alertOrData: ReactElement;

  if (feil || !skrivemodus) {
    alertOrData = <Alert variant="error">{parseHtml(tt("feilmelding.baksystem"))}</Alert>;
  } else if (!skrivemodus.skrivemodus) {
    // Hvis skrivemodues ikke er true:
    // Hvis det finnes infomelding i Skrivemodus, vis denne meldingen
    // Ellers vis standard melding
    let melding = tt("skrivemodusInfomelding");
    if (skrivemodus.melding) {
      melding = i18n.language === "nb" ? skrivemodus.melding.norsk : skrivemodus.melding.engelsk;
    }

    alertOrData = <Alert variant="info">{parseHtml(melding)}</Alert>;
  } else if (!historiskeMeldekort || historiskeMeldekort.length === 0) {
    alertOrData = <Alert variant="warning">{parseHtml(tt("tidligereMeldekort.harIngen"))}</Alert>;
  } else {
    alertOrData = <MeldekorTabell meldekortListe={historiskeMeldekort} />;
  }

  const innhold = <div>{forklaring}{alertOrData}</div>;

  loggAktivitet("Viser tidligere meldekort");

  return (
    <div>
      <MeldekortHeader />
      <Sideinnhold tittel={tt("overskrift.tidligereMeldekort")} innhold={innhold} />
    </div>
  );
}
