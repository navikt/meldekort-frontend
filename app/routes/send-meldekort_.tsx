import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import MeldekortHeader from "~/components/meldekortHeader/MeldekortHeader";
import Sideinnhold from "~/components/sideinnhold/Sideinnhold";
import { useLoaderData } from "@remix-run/react";
import type { ReactElement } from "react";
import { Alert, BodyLong, Box, GuidePanel, Label, Table } from "@navikt/ds-react";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";
import { formaterDato, formaterPeriode, formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/datoUtils";
import { RemixLink } from "~/components/RemixLink";
import type { IPerson } from "~/models/person";
import { hentPerson } from "~/models/person";
import { getOboToken } from "~/utils/authUtils";
import {
  finnFoersteSomIkkeKanSendesEnna,
  finnNesteSomKanSendes,
  meldekortEtterKanSendesFraKomparator
} from "~/utils/meldekortUtils";
import { Navigate } from "react-router";
import { KortStatus } from "~/models/meldekort";


export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort" },
    { name: "description", content: "Send meldekort" }
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

  const nesteMeldekort = finnNesteSomKanSendes(person?.meldekort, "")
  const foersteMeldekortSomIkkeKanSendesEnna = finnFoersteSomIkkeKanSendesEnna(person?.meldekort)

  if (feil || !person) {
    innhold = <Alert variant="error">{parseHtml(tt("feilmelding.baksystem"))}</Alert>
  } else if (!nesteMeldekort) {
    // Det finnes ikke meldekort som kan sendes nå
    // Finnes det meldekort som kan sendes senere?
    if (foersteMeldekortSomIkkeKanSendesEnna) {
      // Ja, det finnes minst et meldekort som kan sendes senere. Viser informasjon om dette meldekortet
      innhold = <GuidePanel>
        <BodyLong>
          {parseHtml(tt("overskrift.nesteMeldekort"))}
          {parseHtml(tt("sendMeldekort.info.innsendingStatus.kanSendes"))}
          {formaterDato(foersteMeldekortSomIkkeKanSendesEnna.meldeperiode.kortKanSendesFra)}
        </BodyLong>
        <Label>
          {tt("overskrift.uke")}
          {formaterPeriode(foersteMeldekortSomIkkeKanSendesEnna.meldeperiode.fra, 0, 14)}
        </Label>
        <BodyLong>
          {parseHtml(tt("sendMeldekort.info.ingenKlare"))}
        </BodyLong>
      </GuidePanel>
    } else {
      // Nei, det finnes ingen meldekort å sende
      innhold = <GuidePanel>
        <div>&nbsp;</div>
        <div>{tt("sporsmal.ingenMeldekortASende")}</div>
      </GuidePanel>
    }
  } else {
    const meldekortListe = person?.meldekort
        .filter(meldekort => meldekort.kortStatus === KortStatus.OPPRE || meldekort.kortStatus === KortStatus.SENDT)
        .filter(meldekort => meldekort.meldeperiode.kanKortSendes)
        .sort(meldekortEtterKanSendesFraKomparator)
      || []

    // Det finnes meldekort som kan sendes nå
    // Men er det ikke for mange?
    if (meldekortListe.length > 5) {
      // Ja, det er for mange. Viser en feilmelding
      innhold = <GuidePanel>
        <BodyLong size="large">
          {parseHtml(tt("sendMeldekort.info.forMangeMeldekort"))}
        </BodyLong>
        <Box padding="2" />
        <BodyLong>
          {parseHtml(tt("sendMeldekort.info.forMangeMeldekort.feilmelding"))}
        </BodyLong>
      </GuidePanel>
    } else if (meldekortListe.length === 1) {
      // Det finnes kun 1 meldekort. Sender brukeren til dette meldekortet med en gang
      innhold = <Navigate to={`/send-meldekort/${meldekortListe[0].meldekortId}`} replace={true} />
    } else {
      // Det finnes flere meldekort. Viser dem
      const nesteMeldekortId = nesteMeldekort.meldekortId

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
            {meldekortListe.map((meldekort) => {
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
  }

  return (
    <div>
      <MeldekortHeader />
      <Sideinnhold tittel={tt("overskrift.innsending")} innhold={innhold} />
    </div>
  )
}
