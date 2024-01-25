import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import MeldekortHeader from "~/components/meldekortHeader/MeldekortHeader";
import Sideinnhold from "~/components/sideinnhold/Sideinnhold";
import type { IPerson } from "~/models/person";
import { hentPerson } from "~/models/person";
import { useLoaderData } from "@remix-run/react";
import { Alert, BodyLong, Table } from "@navikt/ds-react";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";
import type { ReactElement } from "react";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/datoUtils";
import { RemixLink } from "~/components/RemixLink";
import { getOboToken } from "~/utils/authUtils";
import { meldekortEtterKanSendesFraKomparator } from "~/utils/meldekortUtils";

export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort" },
    { name: "description", content: "Etterregistrering" },
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

export default function Etterregistrering() {
  const { tt } = useExtendedTranslation()

  const { feil, person } = useLoaderData<typeof loader>()

  let innhold: ReactElement

  if (feil || !person) {
    innhold = <Alert variant="error">{parseHtml(tt("feilmelding.baksystem"))}</Alert>
  } else if (person.etterregistrerteMeldekort.length === 0) {
    innhold = <div>{tt("sporsmal.ingenMeldekortASende")}</div>
  } else {
    person.etterregistrerteMeldekort.sort(meldekortEtterKanSendesFraKomparator)
    const nesteMeldekortId = person.etterregistrerteMeldekort[0].meldekortId

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
          {person.etterregistrerteMeldekort.map((meldekort) => {
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

      <div className="buttons">
        <div />
        <RemixLink as="Button" variant="primary" to={`/etterregistrering/${nesteMeldekortId}`}>
          {tt("naviger.neste")}
        </RemixLink>
      </div>
    </div>
  }


  return (
    <div>
      <MeldekortHeader />
      <Sideinnhold tittel={tt("overskrift.etterregistrering.innsending")} innhold={innhold} />
    </div>
  )
}
