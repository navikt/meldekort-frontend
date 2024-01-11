import type { MetaFunction } from "@remix-run/node";
import MeldekortHeader from "~/components/meldekortHeader/MeldekortHeader";
import Sideinnhold from "~/components/sideinnhold/Sideinnhold";
import { BodyLong, GuidePanel } from "@navikt/ds-react";
import { useTranslation } from "react-i18next";
import { parseHtml } from "~/utils/intlUtils";

export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort" },
    { name: "description", content: "Generelt om meldekort" },
  ];
};

export default function OmMeldekort() {
  const { t } = useTranslation();

  const innhold = <GuidePanel poster>
    <BodyLong>
      {t("genereltOmMeldekort.velkommen")}
    </BodyLong>
    <BodyLong>
      {t("genereltOmMeldekort.velge")}
      <ul>
        <li>
          {t("genereltOmMeldekort.valg.sende")}
        </li>
        <li>
          {t("genereltOmMeldekort.valg.tidligere")}
        </li>
      </ul>
    </BodyLong>
    <BodyLong>
      {parseHtml(t("genereltOmMeldekort.om.meldekort"),
        [
          "https://www.nav.no",
          t("genereltOmMeldekort.informasjonOmMeldekortLink").trim()
        ]
      )}
    </BodyLong>
    <BodyLong>
      {t("genereltOmMeldekort.oss")}
    </BodyLong>
  </GuidePanel>

  return (
    <div>
      <MeldekortHeader />
      <Sideinnhold tittel={t("overskrift.genereltOmMeldekort")} innhold={innhold} />
    </div>
  );
}
