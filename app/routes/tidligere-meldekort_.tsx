import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
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


export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort" },
    { name: "description", content: "Tidligere meldekort" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  let feil = false;
  let historiskeMeldekort: IMeldekort[] | null = null;

  const onBehalfOfToken = await getOboToken(request);
  const historiskeMeldekortResponse = await hentHistoriskeMeldekort(onBehalfOfToken);

  if (!historiskeMeldekortResponse.ok) {
    feil = true;
  } else {
    historiskeMeldekort = await historiskeMeldekortResponse.json();
  }

  return json({ feil, historiskeMeldekort });
}

export default function TidligereMeldekort() {
  const { tt } = useExtendedTranslation();

  // Hent historiske meldekort
  // Hvis det er feil, vis feilmelding
  // Hvis det ikke finnes historiske meldekort, vis advarselsmelding
  // Hvis historiske meldekort er hentet, vis data

  const { feil, historiskeMeldekort } = useLoaderData<typeof loader>();

  let forklaring = <div>
    <BodyLong spacing>
      {parseHtml(tt("tidligereMeldekort.forklaring"))}
    </BodyLong>
    <BodyLong spacing>
      {parseHtml(tt("tidligereMeldekort.forklaring.korrigering"))}
    </BodyLong>
  </div>;

  let alertOrData: ReactElement;

  if (feil) {
    alertOrData = <Alert variant="error">{parseHtml(tt("feilmelding.baksystem"))}</Alert>;
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
