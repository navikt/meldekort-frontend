import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import MeldekortHeader from "~/components/meldekortHeader/MeldekortHeader";
import Sideinnhold from "~/components/sideinnhold/Sideinnhold";
import { useTranslation } from "react-i18next";
import type { ReactElement } from "react";
import { Alert, BodyLong, Box, Button, Table, Tag } from "@navikt/ds-react";
import { parseHtml } from "~/utils/intlUtils";
import type { IMeldekortdetaljer } from "~/models/meldekortdetaljer";
import { hentMeldekortdetaljer } from "~/models/meldekortdetaljer";
import { formaterDato, formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/datoUtils";
import utklippstavle from "~/img/utklippstavle.svg"
import { formaterBelop } from "~/utils/miscUtils";
import { PrinterSmallFillIcon } from '@navikt/aksel-icons';
import type { IMeldekort } from "~/models/meldekort";
import { hentHistoriskeMeldekort } from "~/models/meldekort";
import { RemixLink } from "~/components/RemixLink";
import {
  finnRiktigTagVariant,
  finnYtelsestypePostfix,
  mapKortStatusTilTekst,
  mapKortTypeTilTekst
} from "~/utils/meldekortUtils";
import SporsmalOgSvar from "~/components/sporsmalOgSvar/SporsmalOgSvar";
import Ukeliste from "~/components/ukeliste/Ukeliste";
import Begrunnelse from "~/components/begrunnelse/Begrunnelse";

export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort" },
    { name: "description", content: "Tidligere meldekort detaljer" },
  ]
}

export async function loader({ params }: LoaderFunctionArgs) {
  let feil = false
  let historiskeMeldekort: IMeldekort[] | null = null
  let meldekortdetaljer: IMeldekortdetaljer | null = null
  let valgtMeldekort: IMeldekort | undefined

  const meldekortId = params.meldekortId

  // Hvis det ikke finnes meldekortId, er det bare feil og det er ingen vits i å gjøre noe viedere
  // Ellers sjekker vi at skrivemodus er OK (true) og at vi kan hente meldekortdetaljer og finne historisk meldekort med gitt meldekortId
  if (!meldekortId) {
    feil = true
  } else {
    const historiskeMeldekortResponse = await hentHistoriskeMeldekort()
    const meldekortdetaljerResponse = await hentMeldekortdetaljer(meldekortId)

    if (!historiskeMeldekortResponse.ok || !meldekortdetaljerResponse.ok) {
      feil = true
    } else {
      historiskeMeldekort = await historiskeMeldekortResponse.json()
      meldekortdetaljer = await meldekortdetaljerResponse.json()

      valgtMeldekort = historiskeMeldekort?.find(meldekort => meldekort.meldekortId.toString(10) === meldekortId)
    }
  }

  return json({ feil, valgtMeldekort, meldekortdetaljer })
}

export default function Meldekortdetaljer() {
  const { feil, valgtMeldekort, meldekortdetaljer } = useLoaderData<typeof loader>()

  const fraDato = valgtMeldekort?.meldeperiode.fra || '1000-01-01'
  const { i18n, t } = useTranslation(fraDato)
  i18n.setDefaultNamespace(fraDato) // Setter Default namespace slik at vi ikke må tenke om dette i alle komponenter

  let innhold: ReactElement

  if (feil || !valgtMeldekort || !meldekortdetaljer) {
    innhold = <Alert variant="error">{parseHtml(t("feilmelding.baksystem"))}</Alert>
  } else {
    const fom = valgtMeldekort.meldeperiode.fra
    const tom = valgtMeldekort.meldeperiode.til
    const ytelsestypePostfix = finnYtelsestypePostfix(valgtMeldekort.meldegruppe)
    const sporsmal = meldekortdetaljer.sporsmal

    innhold = <div>
      <BodyLong as="div" align="center" spacing>
        <img src={utklippstavle} className="imgSmall" alt="" />
        <div>{t("meldekort.for.perioden")}</div>
        <div>
          <h2 className="navds-heading navds-heading--large">
            {t("overskrift.uke")} {formaterPeriodeTilUkenummer(fom, tom)}
          </h2>
        </div>
        <div>{formaterPeriodeDato(fom, tom)}</div>
      </BodyLong>

      <Table zebraStripes>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell scope="col">{t("overskrift.mottatt")}</Table.HeaderCell>
            <Table.HeaderCell scope="col">{t("overskrift.status")}</Table.HeaderCell>
            <Table.HeaderCell scope="col">{t("overskrift.bruttoBelop")}</Table.HeaderCell>
            <Table.HeaderCell scope="col">{t("overskrift.meldekorttype")}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.DataCell>
              {formaterDato(valgtMeldekort.mottattDato)}
            </Table.DataCell>
            <Table.DataCell>
              <Tag variant={finnRiktigTagVariant(valgtMeldekort.kortStatus)}>
                {mapKortStatusTilTekst(t, valgtMeldekort.kortStatus)}
              </Tag>
            </Table.DataCell>
            <Table.DataCell>
              {formaterBelop(valgtMeldekort.bruttoBelop)}
            </Table.DataCell>
            <Table.DataCell>
              {mapKortTypeTilTekst(t, valgtMeldekort.kortType)}
            </Table.DataCell>
          </Table.Row>
        </Table.Body>
      </Table>

      <Box padding="6" />

      <Begrunnelse begrunnelse={meldekortdetaljer.begrunnelse} />

      <SporsmalOgSvar sporsmal={sporsmal} fom={fom} ytelsestypePostfix={ytelsestypePostfix} />

      <hr />

      <Ukeliste dager={sporsmal.meldekortDager} ytelsestypePostfix={ytelsestypePostfix} fom={fom} fraDag={0} tilDag={7} />

      <Ukeliste dager={sporsmal.meldekortDager} ytelsestypePostfix={ytelsestypePostfix} fom={fom} fraDag={7} />

      <div className="buttons">
        <RemixLink as="Button" variant="primary" to="/tidligere-meldekort">
          {t("naviger.tilbake")}
        </RemixLink>
        {
          // Viser Korriger-knappen kun når valgt meldekort er korrigerbart
          valgtMeldekort.korrigerbart &&
            <RemixLink as="Button"
                       variant="secondary"
                       to={`/tidligere-meldekort/${valgtMeldekort.meldekortId}/korriger`}>
              {t("korriger.meldekort")}
            </RemixLink>
        }
      </div>
      <div className="centeredButtons">
        <Button variant="tertiary" icon={<PrinterSmallFillIcon aria-hidden />} onClick={() => window.print()}>
          {t("overskrift.skrivUt")}
        </Button>
      </div>
    </div>
  }

  return (
    <div>
      <MeldekortHeader />
      <Sideinnhold utenSideoverskrift={true} innhold={innhold} />
    </div>
  )
}
