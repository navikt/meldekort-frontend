import type { MetaFunction , LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import MeldekortHeader from "~/components/meldekortHeader/MeldekortHeader";
import Sideinnhold from "~/components/sideinnhold/Sideinnhold";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";
import { Alert, BodyLong, Table, Tag } from "@navikt/ds-react";
import type { ReactElement } from "react";
import { formaterDato, formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/datoUtils";
import type { IMeldekort } from "~/models/meldekort";
import { hentHistoriskeMeldekort, KortStatus } from "~/models/meldekort";
import { formaterBelop } from "~/utils/miscUtils";
import { finnRiktigTagVariant, mapKortStatusTilTekst } from "~/utils/meldekortUtils";
import { NavLink, useLoaderData } from "@remix-run/react";
import { getOboToken } from "~/utils/authUtils";
import { KortType } from "~/models/kortType";

export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort" },
    { name: "description", content: "Tidligere meldekort" },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  let feil = false
  let historiskeMeldekort: IMeldekort[] | null = null

  const onBehalfOfToken = await getOboToken(request)
  const historiskeMeldekortResponse = await hentHistoriskeMeldekort(onBehalfOfToken)

  if (!historiskeMeldekortResponse.ok) {
    feil = true
  } else {
    historiskeMeldekort = await historiskeMeldekortResponse.json()
  }

  return json({ feil, historiskeMeldekort })
}

export default function TidligereMeldekort() {
  const { tt } = useExtendedTranslation()

  // Hent historiske meldekort
  // Hvis det er feil, vis feilmelding
  // Hvis det ikke finnes historiske meldekort, vis advarselsmelding
  // Hvis historiske meldekort er hentet, vis data

  const { feil, historiskeMeldekort } = useLoaderData<typeof loader>()

  let innhold: ReactElement

  if (feil) {
    innhold = <Alert variant="error">{parseHtml(tt("feilmelding.baksystem"))}</Alert>
  } else if (!historiskeMeldekort || historiskeMeldekort.length === 0) {
    innhold = <Alert variant="warning">{parseHtml(tt("tidligereMeldekort.harIngen"))}</Alert>
  } else {
    innhold = <div>
      <BodyLong spacing>
        {parseHtml(tt("tidligereMeldekort.forklaring"))}
      </BodyLong>
      <BodyLong spacing>
        {parseHtml(tt("tidligereMeldekort.forklaring.korrigering"))}
      </BodyLong>
      <Table zebraStripes>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell scope="col">{tt("overskrift.periode")}</Table.HeaderCell>
            <Table.HeaderCell scope="col">{tt("overskrift.dato")}</Table.HeaderCell>
            <Table.HeaderCell scope="col">{tt("overskrift.mottatt")}</Table.HeaderCell>
            <Table.HeaderCell scope="col">{tt("overskrift.status")}</Table.HeaderCell>
            <Table.HeaderCell scope="col">{tt("overskrift.bruttoBelop")}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {historiskeMeldekort.map((meldekort) => {
            return (
              <Table.Row key={meldekort.meldekortId} shadeOnHover={false}>
                <Table.DataCell>
                  <NavLink to={"/tidligere-meldekort/" + meldekort.meldekortId}>
                    {tt("overskrift.uke")} {formaterPeriodeTilUkenummer(meldekort.meldeperiode.fra, meldekort.meldeperiode.til)}
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
                    {mapKortStatusTilTekst(tt, meldekort.kortStatus)}
                  </Tag>
                </Table.DataCell>
                <Table.DataCell>
                  {
                    (meldekort.kortStatus === KortStatus.FERDI && meldekort.kortType !== KortType.KORRIGERT_ELEKTRONISK)
                      ? formaterBelop(meldekort.bruttoBelop)
                      : ""
                  }
                </Table.DataCell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
    </div>
  }

  return (
    <div>
      <MeldekortHeader />
      <Sideinnhold tittel={tt("overskrift.tidligereMeldekort")} innhold={innhold} />
    </div>
  )
}
