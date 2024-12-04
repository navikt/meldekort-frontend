import { Alert, BodyLong, GuidePanel, Table } from "@navikt/ds-react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { ReactElement } from "react";
import { Navigate } from "react-router";

import MeldekortHeader from "~/components/meldekortHeader/MeldekortHeader";
import { RemixLink } from "~/components/RemixLink";
import Sideinnhold from "~/components/sideinnhold/Sideinnhold";
import { KortStatus } from "~/models/meldekort";
import type { IPerson } from "~/models/person";
import { hentPerson } from "~/models/person";
import { loggAktivitet } from "~/utils/amplitudeUtils";
import { getOboToken } from "~/utils/authUtils";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/datoUtils";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";
import { meldekortEtterKanSendesFraKomparator } from "~/utils/meldekortUtils";


export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort" },
    { name: "description", content: "Etterregistrering" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  let feil = false;
  let person: IPerson | null = null;

  const onBehalfOfToken = await getOboToken(request);
  const personResponse = await hentPerson(onBehalfOfToken);

  if (!personResponse.ok) {
    feil = true;
  } else {
    person = await personResponse.json();
  }

  return { feil, person };
}

export default function Etterregistrering() {
  const { tt } = useExtendedTranslation();

  const { feil, person } = useLoaderData<typeof loader>();

  let innhold: ReactElement;

  const meldekortListe = person?.etterregistrerteMeldekort
      .filter(meldekort => meldekort.kortStatus === KortStatus.OPPRE || meldekort.kortStatus === KortStatus.SENDT)
      .filter(meldekort => meldekort.meldeperiode.kanKortSendes)
      .sort(meldekortEtterKanSendesFraKomparator)
    || [];

  if (feil || !person) {
    innhold = <Alert variant="error">{parseHtml(tt("feilmelding.baksystem"))}</Alert>;
  } else if (meldekortListe.length === 0) {
    innhold = <GuidePanel>
      <div>&nbsp;</div>
      <div>{tt("sporsmal.ingenMeldekortASende")}</div>
    </GuidePanel>;
  } else if (meldekortListe.length === 1) {
    // Det finnes kun 1 meldekort. Sender brukeren til dette meldekortet med en gang
    innhold = <Navigate to={`/etterregistrer-meldekort/${meldekortListe[0].meldekortId}`} replace={true} />;
  } else {
    const nesteMeldekortId = meldekortListe[0].meldekortId;

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
            );
          })}
        </Table.Body>
      </Table>

      <div className="buttons">
        <div />
        <RemixLink as="Button" variant="primary" to={`/etterregistrer-meldekort/${nesteMeldekortId}`}>
          {tt("naviger.neste")}
        </RemixLink>
      </div>
    </div>;
  }

  loggAktivitet("Viser etterregistrere meldekort");

  return (
    <div>
      <MeldekortHeader />
      <Sideinnhold tittel={tt("overskrift.etterregistrering.innsending")} innhold={innhold} />
    </div>
  );
}
