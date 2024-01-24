import type { MetaFunction } from "@remix-run/node";
import MeldekortHeader from "~/components/meldekortHeader/MeldekortHeader";
import Sideinnhold from "~/components/sideinnhold/Sideinnhold";
import { BodyLong, GuidePanel } from "@navikt/ds-react";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";

export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort" },
    { name: "description", content: "Generelt om meldekort" },
  ]
}

export default function OmMeldekort() {
  const { tt } = useExtendedTranslation()

  const innhold = <GuidePanel poster>
    <BodyLong>
      {tt("genereltOmMeldekort.velkommen")}
    </BodyLong>
    <BodyLong>
      {tt("genereltOmMeldekort.velge")}
      <ul>
        <li>
          {tt("genereltOmMeldekort.valg.sende")}
        </li>
        <li>
          {tt("genereltOmMeldekort.valg.tidligere")}
        </li>
      </ul>
    </BodyLong>
    <BodyLong>
      {parseHtml(tt("genereltOmMeldekort.om.meldekort"),
        [
          "https://www.nav.no",
          tt("genereltOmMeldekort.informasjonOmMeldekortLink").trim()
        ]
      )}
    </BodyLong>
    <BodyLong>
      {tt("genereltOmMeldekort.oss")}
    </BodyLong>
  </GuidePanel>

  return (
    <div>
      <MeldekortHeader />
      <Sideinnhold tittel={tt("overskrift.genereltOmMeldekort")} innhold={innhold} />
    </div>
  )
}
