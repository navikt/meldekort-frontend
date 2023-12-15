import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import MeldekortHeader from "~/components/meldekortHeader/MeldekortHeader";
import Sideinnhold from "~/components/sideinnhold/Sideinnhold";
import { useTranslation } from "react-i18next";
import { formatHtmlMessage } from "~/utils/intlUtils";
import { Alert, BodyLong, Table, Tag } from "@navikt/ds-react";
import type { ReactElement } from "react";
import { formaterDato, formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/datoUtils";
import type { IMeldekort } from "~/models/meldekort";
import { hentHistoriskeMeldekort } from "~/models/meldekort";
import { finnRiktigTagVariant, formaterBelop, mapKortStatusTilTekst } from "~/utils/miscUtils";
import { NavLink, useLoaderData } from "@remix-run/react";
import type { ISkrivemodus } from "~/models/skrivemodus";
import { hentSkrivemodus } from "~/models/skrivemodus";

export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort" },
    { name: "description", content: "Tidligere meldekort" },
  ];
};

export async function loader() {
  let feil = false;
  let skrivemodus: ISkrivemodus | null = null;
  let historiskeMeldekort: IMeldekort[] | null = null;

  const skrivemodusResponse = await hentSkrivemodus();
  const historiskeMeldekortResponse = await hentHistoriskeMeldekort();

  if (!skrivemodusResponse.ok) {
    feil = true
  } else {
    skrivemodus = await skrivemodusResponse.json();
  }

  if (!historiskeMeldekortResponse.ok) {
    feil = true
  } else {
    historiskeMeldekort = await historiskeMeldekortResponse.json();
  }

  return json({ feil, skrivemodus, historiskeMeldekort });
}

export default function TidligereMeldekort_() {
  const { i18n, t } = useTranslation();

  // Hent skrivemodus
  // Hent historiske meldekort
  // Hvis det er feil, vis feilmelding
  // Hvis skrivemodus ikke er OK, vis infomelding
  // Hvis historiske meldekort ikke er hentet, vis advarselsmelding
  // Hvis historiske meldekort er hentet, vis data

  const { feil, skrivemodus, historiskeMeldekort } = useLoaderData<typeof loader>();

  let innhold: ReactElement

  if (feil) {
    innhold = <Alert variant="error">{formatHtmlMessage(t("feilmelding.baksystem"))}</Alert>
  } else if (skrivemodus?.skrivemodus !== true) {
    // Hvis skrivemodues ikke er OK (ikke true):
    // Hvis det finnes infomelding i Skrivemodus, vis denne meldingen
    // Ellers vis standard melding
    let melding = t("skrivemodusInfomelding")
    if (!!skrivemodus && !!skrivemodus.melding) {
      melding = i18n.language === "nb" ? skrivemodus.melding.norsk : skrivemodus.melding.engelsk;
    }

    innhold = <Alert variant="info">{formatHtmlMessage(melding)}</Alert>
  } else if (!historiskeMeldekort || historiskeMeldekort.length === 0) {
    innhold = <Alert variant="warning">{formatHtmlMessage(t("tidligereMeldekort.harIngen"))}</Alert>
  } else {
    innhold = <div>
      <BodyLong spacing>
        {formatHtmlMessage(t("tidligereMeldekort.forklaring"))}
      </BodyLong>
      <BodyLong spacing>
        {formatHtmlMessage(t("tidligereMeldekort.forklaring.korrigering"))}
      </BodyLong>
      <Table zebraStripes>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell scope="col">{t("overskrift.periode")}</Table.HeaderCell>
            <Table.HeaderCell scope="col">{t("overskrift.dato")}</Table.HeaderCell>
            <Table.HeaderCell scope="col">{t("overskrift.mottatt")}</Table.HeaderCell>
            <Table.HeaderCell scope="col">{t("overskrift.status")}</Table.HeaderCell>
            <Table.HeaderCell scope="col">{t("overskrift.bruttoBelop")}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {historiskeMeldekort.map((meldekort) => {
            return (
              <Table.Row key={meldekort.meldekortId}>
                <Table.DataCell>
                  <NavLink to={"/tidligere-meldekort/" + meldekort.meldekortId}>
                    {t("overskrift.uke")} {formaterPeriodeTilUkenummer(meldekort.meldeperiode.fra, meldekort.meldeperiode.til)}
                  </NavLink>
                </Table.DataCell>
                <Table.DataCell>
                  {formaterPeriodeDato(meldekort.meldeperiode.fra, meldekort.meldeperiode.til)}
                </Table.DataCell>
                <Table.DataCell>
                  {formaterDato(meldekort.mottattDato)}
                </Table.DataCell>
                <Table.DataCell>
                  <Tag variant={finnRiktigTagVariant(meldekort.kortStatus)}>
                    {mapKortStatusTilTekst(t, meldekort.kortStatus)}
                  </Tag>
                </Table.DataCell>
                <Table.DataCell>
                  {formaterBelop(meldekort.bruttoBelop)}
                </Table.DataCell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </div>
  }

  return (
    <div>
      <MeldekortHeader />
      <Sideinnhold tittel={t("overskrift.tidligereMeldekort")} innhold={innhold} />
    </div>
  );
}
