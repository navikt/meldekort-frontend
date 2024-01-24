import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import MeldekortHeader from "~/components/meldekortHeader/MeldekortHeader";
import Sideinnhold from "~/components/sideinnhold/Sideinnhold";
import { useLoaderData } from "@remix-run/react";
import type { ReactElement } from "react";
import { Alert, BodyLong, Box, Table } from "@navikt/ds-react";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/datoUtils";
import { RemixLink } from "~/components/RemixLink";
import type { IPerson } from "~/models/person";
import { hentPerson } from "~/models/person";
import { getOboToken } from "~/utils/authUtils";

export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort" },
    { name: "description", content: "Send meldekort" },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  let feil = false
  let person: IPerson | null = null

  const onBehalfOfToken = await getOboToken(request)
  const personResponse = await hentPerson(onBehalfOfToken)

  if (!personResponse.ok) {
    feil = true
  } else {
    person = await personResponse.json()
  }

  return json({ feil, person })
}

export default function SendMeldekort() {
  const { tt } = useExtendedTranslation()

  const { feil, person } = useLoaderData<typeof loader>()

  let innhold: ReactElement

  if (feil || !person) {
    innhold = <Alert variant="error">{parseHtml(tt("feilmelding.baksystem"))}</Alert>
  } else {
    const nesteMeldekortId = person.meldekort[0].meldekortId

    innhold = <div>
      <BodyLong spacing>
        {parseHtml(tt("sendMeldekort.info.kanSende"))}
      </BodyLong>
      <Table zebraStripes>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell scope="col">{tt("overskrift.periode")}</Table.HeaderCell>
            <Table.HeaderCell scope="col">{tt("overskrift.dato")}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {person.meldekort.map((meldekort) => {
            return (
              <Table.Row key={meldekort.meldekortId} shadeOnHover={false}>
                <Table.DataCell>
                  {tt("overskrift.uke")} {formaterPeriodeTilUkenummer(meldekort.meldeperiode.fra, meldekort.meldeperiode.til)}
                </Table.DataCell>
                <Table.DataCell>
                  {formaterPeriodeDato(meldekort.meldeperiode.fra, meldekort.meldeperiode.til)}
                </Table.DataCell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>

      <Box padding="4" />

      <Box padding="4" borderColor="border-subtle" borderWidth="2" borderRadius="xlarge">
        <div>{parseHtml(tt("sendMeldekort.info.neste"))}</div>
        <div>{parseHtml(tt("sendMeldekort.info.eldstePerioden"))}</div>
        <div>{parseHtml(tt("sendMeldekort.info.automatiskLedet"))}</div>
      </Box>

      <div className="buttons">
        <div />
        <RemixLink as="Button" variant="primary" to={`/send-meldekort/${nesteMeldekortId}`}>
          {tt("naviger.neste")}
        </RemixLink>
      </div>
    </div>
  }

  return (
    <div>
      <MeldekortHeader />
      <Sideinnhold tittel={tt("overskrift.innsending")} innhold={innhold} />
    </div>
  )
}
