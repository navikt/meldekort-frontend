import { Accordion } from "@navikt/ds-react";
import type { MetaFunction } from "react-router";

import MeldekortHeader from "~/components/meldekortHeader/MeldekortHeader";
import Sideinnhold from "~/components/sideinnhold/Sideinnhold";
import sporrende from "~/img/sporrende.svg";
import { loggAktivitet } from "~/utils/amplitudeUtils";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";


export const meta: MetaFunction = () => {
    return [
      { title: "Meldekort" },
      { name: "description", content: "Ofte stilte spørsmål" },
    ];
  }
;
export default function OfteStilteSporsmal() {
  const { tt } = useExtendedTranslation();

  const innhold = <div>
    <img src={sporrende} className="img" alt="" />
    <Accordion>
      <Accordion.Item key="1">
        <Accordion.Header>
          {tt("oss.sende.overskrift")}
        </Accordion.Header>
        <Accordion.Content>
          {parseHtml(tt("oss.sende.tekst"))}
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item key="2">
        <Accordion.Header>
          {tt("oss.frist.overskrift")}
        </Accordion.Header>
        <Accordion.Content>
          {parseHtml(tt("oss.frist.tekst"))}
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item key="3">
        <Accordion.Header>
          {tt("oss.korrigere.overskrift")}
        </Accordion.Header>
        <Accordion.Content>
          {parseHtml(tt("oss.korrigere.tekst"))}
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item key="4">
        <Accordion.Header>
          {tt("oss.pengene.overskrift")}
        </Accordion.Header>
        <Accordion.Content>
          {parseHtml(tt("oss.pengene.tekst"))}
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item key="5">
        <Accordion.Header>
          {tt("oss.utbetalt.overskrift")}
        </Accordion.Header>
        <Accordion.Content>
          {parseHtml(tt("oss.utbetalt.tekst"))}
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  </div>;

  loggAktivitet("Viser ofte stilte spørsmål");

  return (
    <div>
      <MeldekortHeader />
      <Sideinnhold tittel={tt("overskrift.ofteStilteSporsmal")} innhold={innhold} />
    </div>
  );
}
