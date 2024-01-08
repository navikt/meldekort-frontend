import { useTranslation } from "react-i18next";
import { Alert, BodyLong, Box, Button } from "@navikt/ds-react";
import { formatHtmlMessage } from "~/utils/intlUtils";
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

interface IProps {
  minSideUrl: string;
  innsendingstype: Innsendingstype;
  ytelsestypePostfix: string;
  personInfo: IPersonInfo;
  fom: string;
  tom: string;
  begrunnelse: string;
  sporsmal: ISporsmal;
  forrigeOnclickHandler: Function;
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
    sporsmal
  } = props

  const { t } = useTranslation(fom)

  const mottattDato= new Date() // API returnerer ikke noe mottat dato og vi må bare ta nåværende tidspunkt
  const nesteDato = false // TODO: Finn neste dato hvis det ikke er ETTERREGISTRERING eller KORRIGERING

  // TODO: Finn neste URL når INNSENDING eller ETTERREGISTRERING
  let nesteLink = <NavLink to={minSideUrl}>{t("tilbake.minSide")}</NavLink>
  if (innsendingstype === Innsendingstype.INNSENDING) {
    // harBrukerFlereMeldekort ? nesteMeldekort
    // harBrukerFlereEtterregistrerteMeldekort ? nesteEtterregistrering
    nesteLink = <RemixLink as="Button" variant="primary" to="">{t("overskrift.nesteMeldekort")}</RemixLink>
  } else if (innsendingstype === Innsendingstype.ETTERREGISTRERING) {
    // harBrukerFlereEtterregistrerteMeldekort ? nesteEtterregistrering
    // harBrukerFlereMeldekort ? nesteMeldekort
    nesteLink = <RemixLink as="Button" variant="primary" to="">{t("overskrift.etterregistrertMeldekort")}</RemixLink>
  }

  return (
    <div>
      <Alert variant="success">
        {formatHtmlMessage(t("overskrift.meldekort.sendt"))}
      </Alert>

      <Box padding="4" />

      {ytelsestypePostfix === Ytelsestype.DAGPENGER &&
          <div>
              <Alert variant="info">
                {formatHtmlMessage(t("sendt.klagerettigheterInfo" + ytelsestypePostfix))}
              </Alert>

              <Box padding="4" />
          </div>
      }

      <BodyLong size="large">
        {t("meldekort.for")} {personInfo.fornavn} {personInfo.etternavn} ({personInfo.fodselsnr})
      </BodyLong>
      <BodyLong size="large">
        {t("meldekort.for.perioden")} {t("overskrift.uke")} {formaterPeriodeTilUkenummer(fom, tom)} ({formaterPeriodeDato(fom, tom)})
      </BodyLong>
      <BodyLong size="large">
        {formatHtmlMessage(
          t("sendt.mottatt.label"),
          [formaterDato(mottattDato), mottattDato.getHours() + ":" + mottattDato.getMinutes()]
        )}
      </BodyLong>
      {nesteDato && (
        <BodyLong size="large">
            <span>
              {formatHtmlMessage(
                t("sendt.meldekortKanSendes"),
                [formaterDato(nesteDato)]
              )}
            </span>
        </BodyLong>
      )}

      <Box padding="6" />

      <Begrunnelse begrunnelse={begrunnelse} />

      <SporsmalOgSvar sporsmal={sporsmal} fom={fom} ytelsestypePostfix={ytelsestypePostfix} />

      <hr />

      <Ukeliste dager={sporsmal.meldekortDager} ytelsestypePostfix={ytelsestypePostfix} fom={fom} fraDag={0} tilDag={7} />

      <Ukeliste dager={sporsmal.meldekortDager} ytelsestypePostfix={ytelsestypePostfix} fom={fom} fraDag={7} />

      <Box padding="6" />

      <div className="buttons">
        <RemixLink as="Button" variant="secondary" to="/tidligere-meldekort">
          {t("sendt.linkTilTidligereMeldekort")}
        </RemixLink>
        {nesteLink}
      </div>
      <div className="centeredButtons">
        <Button variant="tertiary" icon={<PrinterSmallFillIcon aria-hidden />} onClick={() => window.print()}>
          {t("overskrift.skrivUt")}
        </Button>
      </div>
    </div>
  )
}
