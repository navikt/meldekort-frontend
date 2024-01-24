import { Alert, BodyLong, Box, Button } from "@navikt/ds-react";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";
import { PrinterSmallFillIcon } from "@navikt/aksel-icons";
import { Ytelsestype } from "~/models/ytelsestype";
import Begrunnelse from "~/components/begrunnelse/Begrunnelse";
import SporsmalOgSvar from "~/components/sporsmalOgSvar/SporsmalOgSvar";
import Ukeliste from "~/components/ukeliste/Ukeliste";
import type { ISporsmal } from "~/models/sporsmal";
import { RemixLink } from "~/components/RemixLink";
import { formaterDato, formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/datoUtils";
import type { IPersonInfo } from "~/models/person";
import { NavLink } from "@remix-run/react";
import { Innsendingstype } from "~/models/innsendingstype";
import { format } from "date-fns";

interface IProps {
  minSideUrl: string;
  innsendingstype: Innsendingstype;
  ytelsestypePostfix: string;
  personInfo: IPersonInfo;
  fom: string;
  tom: string;
  begrunnelse: string;
  sporsmal: ISporsmal;
  nesteMeldekort: Number | undefined;
  nesteEtterregistrerteMeldekort: Number | undefined;
}

export default function Kvittering(props: IProps) {
  const {
    minSideUrl,
    innsendingstype,
    ytelsestypePostfix,
    personInfo,
    fom,
    tom,
    begrunnelse,
    sporsmal,
    nesteMeldekort,
    nesteEtterregistrerteMeldekort
  } = props

  const { tt } = useExtendedTranslation()

  const mottattDato = new Date() // API returnerer ikke noe mottat dato og vi må bare ta nåværende tidspunkt
  const nesteDato = false // TODO: Finn neste dato hvis det ikke er ETTERREGISTRERING eller KORRIGERING

  const createButton = (to: string, text: string) => {
    return <Button variant="primary" onClick={() => {location.href=to}}>{text}</Button>
  }

  let nesteLink = <NavLink to={minSideUrl}>{tt("tilbake.minSide")}</NavLink>
  const mLink = createButton(`/send-meldekort/${nesteMeldekort}`, tt("overskrift.etterregistrertMeldekort"))
  const eLink = createButton(`/etterregistrering/${nesteEtterregistrerteMeldekort}`, tt("overskrift.etterregistrertMeldekort"))

  if (innsendingstype === Innsendingstype.INNSENDING) {
    if (nesteMeldekort) {
      nesteLink = mLink
    } else if (nesteEtterregistrerteMeldekort) {
      nesteLink = eLink
    }
  } else if (innsendingstype === Innsendingstype.ETTERREGISTRERING) {
    if (nesteEtterregistrerteMeldekort) {
      nesteLink = eLink
    } else if (nesteMeldekort) {
      nesteLink = mLink
    }
  }

  return (
    <div>
      <Alert variant="success">
        {parseHtml(tt("overskrift.meldekort.sendt"))}
      </Alert>

      <Box padding="4" />

      {(ytelsestypePostfix === Ytelsestype.DAGPENGER || ytelsestypePostfix === Ytelsestype.AAP) &&
          <div>
              <Alert variant="info">
                {parseHtml(tt("sendt.klagerettigheterInfo" + ytelsestypePostfix))}
              </Alert>

              <Box padding="4" />
          </div>
      }

      <BodyLong size="large">
        {tt("meldekort.for")} {personInfo.fornavn} {personInfo.etternavn} ({personInfo.fodselsnr})
      </BodyLong>
      <BodyLong size="large">
        {tt("meldekort.for.perioden")} {tt("overskrift.uke")} {formaterPeriodeTilUkenummer(fom, tom)} ({formaterPeriodeDato(fom, tom)})
      </BodyLong>
      <BodyLong size="large">
        {parseHtml(
          tt("sendt.mottatt.label"),
          [formaterDato(mottattDato), format(mottattDato, "HH:mm")]
        )}
      </BodyLong>
      {nesteDato && (
        <BodyLong size="large">
            <span>
              {parseHtml(
                tt("sendt.meldekortKanSendes"),
                [formaterDato(nesteDato)]
              )}
            </span>
        </BodyLong>
      )}

      <Box padding="6" />

      {
        innsendingstype === Innsendingstype.KORRIGERING && <Begrunnelse begrunnelse={begrunnelse} />
      }

      <SporsmalOgSvar sporsmal={sporsmal} fom={fom} ytelsestypePostfix={ytelsestypePostfix} />

      <hr />

      <Ukeliste dager={sporsmal.meldekortDager} ytelsestypePostfix={ytelsestypePostfix} fom={fom} fraDag={0} tilDag={7} />

      <Ukeliste dager={sporsmal.meldekortDager} ytelsestypePostfix={ytelsestypePostfix} fom={fom} fraDag={7} />

      <div className="buttons">
        <RemixLink as="Button" variant="secondary" to="/tidligere-meldekort">
          {tt("sendt.linkTilTidligereMeldekort")}
        </RemixLink>
        {nesteLink}
      </div>
      <div className="centeredButtons">
        <Button variant="tertiary" icon={<PrinterSmallFillIcon aria-hidden />} onClick={() => window.print()}>
          {tt("overskrift.skrivUt")}
        </Button>
      </div>
    </div>
  )
}
