import type { MetaFunction } from "@remix-run/node";
import MeldekortHeader from "~/components/meldekortHeader/MeldekortHeader";
import { useTranslation } from "react-i18next";
import { Accordion } from "@navikt/ds-react";
import { parseHtml } from "~/utils/intlUtils";
import Sideinnhold from "~/components/sideinnhold/Sideinnhold";
import sporrende from "~/img/sporrende.svg"

export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort" },
    { name: "description", content: "Ofte stilte spørsmål" },
  ];
};

export default function OfteStilteSporsmal() {
  const { t } = useTranslation();

  const innhold = <div>
    <img src={sporrende} className="img" alt="" />
    <Accordion>
      <Accordion.Item key="1">
        <Accordion.Header>
          {t("oss.sende.overskrift")}
        </Accordion.Header>
        <Accordion.Content>
          {parseHtml(t("oss.sende.tekst"))}
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item key="2">
        <Accordion.Header>
          {t("oss.frist.overskrift")}
        </Accordion.Header>
        <Accordion.Content>
          {parseHtml(t("oss.frist.tekst"))}
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item key="3">
        <Accordion.Header>
          {t("oss.korrigere.overskrift")}
        </Accordion.Header>
        <Accordion.Content>
          {parseHtml(t("oss.korrigere.tekst"))}
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item key="4">
        <Accordion.Header>
          {t("oss.pengene.overskrift")}
        </Accordion.Header>
        <Accordion.Content>
          {parseHtml(t("oss.pengene.tekst"))}
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item key="5">
        <Accordion.Header>
          {t("oss.utbetalt.overskrift")}
        </Accordion.Header>
        <Accordion.Content>
          {parseHtml(t("oss.utbetalt.tekst"))}
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  </div>

  return (
    <div>
      <MeldekortHeader />
      <Sideinnhold tittel={t("overskrift.ofteStilteSporsmal")} innhold={innhold} />
    </div>
  );
}
