import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import MeldekortHeader from "~/components/meldekortHeader/MeldekortHeader";
import Sideinnhold from "~/components/sideinnhold/Sideinnhold";
import type { ReactElement } from "react";
import { Alert, BodyLong, Box, Button, Table, Tag } from "@navikt/ds-react";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";
import type { IMeldekortdetaljer } from "~/models/meldekortdetaljer";
import { hentMeldekortdetaljer } from "~/models/meldekortdetaljer";
import { formaterDato, formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/datoUtils";
import nav from "~/img/nav.svg";
import utklippstavle from "~/img/utklippstavle.svg";
import { formaterBelop } from "~/utils/miscUtils";
import { PrinterSmallFillIcon } from "@navikt/aksel-icons";
import type { IMeldekort } from "~/models/meldekort";
import { hentHistoriskeMeldekort, KortStatus } from "~/models/meldekort";
import { RemixLink } from "~/components/RemixLink";
import {
  finnRiktigTagVariant,
  finnYtelsestypePostfix,
  mapKortStatusTilTekst,
  mapKortTypeTilTekst,
} from "~/utils/meldekortUtils";
import SporsmalOgSvar from "~/components/sporsmalOgSvar/SporsmalOgSvar";
import Ukeliste from "~/components/ukeliste/Ukeliste";
import Begrunnelse from "~/components/begrunnelse/Begrunnelse";
import { getOboToken } from "~/utils/authUtils";
import type { IPersonInfo } from "~/models/person";
import { hentPersonInfo } from "~/models/person";
import LoaderMedPadding from "~/components/LoaderMedPadding";
import { getEnv } from "~/utils/envUtils";


export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort" },
    { name: "description", content: "Tidligere meldekort detaljer" },
  ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  let feil = false;
  let historiskeMeldekort: IMeldekort[] | null = null;
  let meldekortdetaljer: IMeldekortdetaljer | null = null;
  let personInfo: IPersonInfo | null = null;
  let valgtMeldekort: IMeldekort | undefined;

  const meldekortId = params.meldekortId;

  // Hvis det ikke finnes meldekortId, er det bare feil og det er ingen vits i å gjøre noe viedere
  if (!meldekortId) {
    feil = true;
  } else {
    const onBehalfOfToken = await getOboToken(request);
    const historiskeMeldekortResponse = await hentHistoriskeMeldekort(onBehalfOfToken);
    const meldekortdetaljerResponse = await hentMeldekortdetaljer(onBehalfOfToken, meldekortId);
    const personInfoResponse = await hentPersonInfo(onBehalfOfToken);

    if (!historiskeMeldekortResponse.ok || !meldekortdetaljerResponse.ok || !personInfoResponse.ok) {
      feil = true;
    } else {
      historiskeMeldekort = await historiskeMeldekortResponse.json();
      meldekortdetaljer = await meldekortdetaljerResponse.json();
      personInfo = await personInfoResponse.json();

      valgtMeldekort = historiskeMeldekort?.find(meldekort => meldekort.meldekortId.toString(10) === meldekortId);
    }
  }

  return json({ feil, valgtMeldekort, meldekortdetaljer, personInfo });
}

export default function Meldekortdetaljer() {
  const { feil, valgtMeldekort, meldekortdetaljer, personInfo } = useLoaderData<typeof loader>();

  const fraDato = valgtMeldekort?.meldeperiode.fra || "1000-01-01";
  const { i18n, tt } = useExtendedTranslation(fraDato);
  i18n.setDefaultNamespace(fraDato); // Setter Default namespace slik at vi ikke må tenke om dette i alle komponenter

  let innhold: ReactElement;

  // Sjekk at vi allerede har tekster, ellers vis loader
  if (!i18n.hasLoadedNamespace(fraDato)) {
    return <LoaderMedPadding />;
  }

  if (feil || !valgtMeldekort || !meldekortdetaljer || !personInfo) {
    innhold = <Alert variant="error">{parseHtml(tt("feilmelding.baksystem"))}</Alert>;
  } else {
    const fom = valgtMeldekort.meldeperiode.fra;
    const tom = valgtMeldekort.meldeperiode.til;
    const ytelsestypePostfix = finnYtelsestypePostfix(valgtMeldekort.meldegruppe);
    const sporsmal = meldekortdetaljer.sporsmal;

    innhold = <div>
      <BodyLong as="div" align="center" spacing className="onlyForPrint">
        <img src={nav} className="imgBig" alt="" />
        <br /><br />
        {tt("meldekort.for")}
        <br />
        <h2 className="navds-heading navds-heading--medium">
          {personInfo.fornavn.toUpperCase()} {personInfo.etternavn.toUpperCase()} ({personInfo.fodselsnr})
        </h2>
      </BodyLong>
      <BodyLong as="div" align="center" spacing>
        <img src={utklippstavle} className="imgSmall notForPrint" alt="" />
        <div>{tt("meldekort.for.perioden")}</div>
        <div>
          <h2 className="navds-heading navds-heading--large">
            {tt("overskrift.uke")} {formaterPeriodeTilUkenummer(fom, tom)}
          </h2>
        </div>
        <div>{formaterPeriodeDato(fom, tom)}</div>
      </BodyLong>

      <Table zebraStripes>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell scope="col">{tt("overskrift.mottatt")}</Table.HeaderCell>
            <Table.HeaderCell scope="col">{tt("overskrift.status")}</Table.HeaderCell>
            <Table.HeaderCell scope="col">{tt("overskrift.bruttoBelop")}</Table.HeaderCell>
            <Table.HeaderCell scope="col">{tt("overskrift.meldekorttype")}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.DataCell>
              {formaterDato(valgtMeldekort.mottattDato)}
            </Table.DataCell>
            <Table.DataCell>
              <Tag variant={finnRiktigTagVariant(valgtMeldekort.kortStatus, valgtMeldekort.kortType)}>
                {mapKortStatusTilTekst(valgtMeldekort.kortStatus, valgtMeldekort.kortType)}
              </Tag>
            </Table.DataCell>
            <Table.DataCell>
              {(valgtMeldekort.kortStatus === KortStatus.FERDI) ? formaterBelop(valgtMeldekort.bruttoBelop) : ""}
            </Table.DataCell>
            <Table.DataCell>
              {mapKortTypeTilTekst(valgtMeldekort.kortType)}
            </Table.DataCell>
          </Table.Row>
        </Table.Body>
      </Table>

      <Box padding="6" />

      {
        meldekortdetaljer.begrunnelse &&
        <Begrunnelse begrunnelse={meldekortdetaljer.begrunnelse} ytelsestypePostfix={ytelsestypePostfix} />
      }

      <SporsmalOgSvar sporsmal={sporsmal} fom={fom} ytelsestypePostfix={ytelsestypePostfix} />

      <hr />

      <div className="ukelister">
        <Ukeliste dager={sporsmal.meldekortDager} ytelsestypePostfix={ytelsestypePostfix} fom={fom} fraDag={0}
                  tilDag={7} />

        <Ukeliste dager={sporsmal.meldekortDager} ytelsestypePostfix={ytelsestypePostfix} fom={fom} fraDag={7} />
      </div>

      <div className="buttons notForPrint">
        <RemixLink as="Button" variant="primary" to={"/tidligere-meldekort"}>
          {tt("naviger.tilbake")}
        </RemixLink>
        {
          // Viser Korriger-knappen kun når valgt meldekort er korrigerbart
          valgtMeldekort.korrigerbart &&
          <RemixLink as="Button"
                     variant="secondary"
                     to={`/tidligere-meldekort/${valgtMeldekort.meldekortId}/korriger`}>
            {tt("korriger.meldekort")}
          </RemixLink>
        }
      </div>
      <div className="centeredButtons notForPrint">
        <Button variant="tertiary" icon={<PrinterSmallFillIcon aria-hidden />} onClick={() => window.print()}>
          {tt("overskrift.skrivUt")}
        </Button>
      </div>
    </div>;
  }

  return (
    <div>
      <MeldekortHeader />
      <Sideinnhold utenSideoverskrift={true} innhold={innhold} />
    </div>
  );
}
