import { Alert, Heading } from "@navikt/ds-react";
import type { MetaFunction } from "@remix-run/node";

import Sideinnhold from "~/components/sideinnhold/Sideinnhold";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";


export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort" },
    { name: "description", content: "Du har ikke tilgang" },
  ];
};

export default function IkkeTilgang() {
  const { tt } = useExtendedTranslation();

  const alert = <Alert variant="error">
    <Heading spacing size="small" level="3">{parseHtml(tt("ikke.tilgang.overskrift"))}</Heading>
    {parseHtml(tt("ikke.tilgang.tekst"))}
  </Alert>;

  return (
    <Sideinnhold utenSideoverskrift={true} innhold={alert} />
  );
}
