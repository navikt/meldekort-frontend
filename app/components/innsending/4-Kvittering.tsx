import { Alert, BodyLong, Box, Button } from "@navikt/ds-react";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";
import { PrinterSmallFillIcon } from "@navikt/aksel-icons";
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
import { Ytelsestype } from "~/models/ytelsestype";
import nav from "~/img/nav.svg";
import type { Meldegruppe } from "~/models/meldegruppe";
import { loggAktivitet } from "~/utils/amplitudeUtils";
import { getEnv } from "~/utils/envUtils";


interface IProps {
  innsendingstype: Innsendingstype;
  ytelsestypePostfix: string;
  meldegruppe: Meldegruppe;
  personInfo: IPersonInfo;
  fom: string;
  tom: string;
  begrunnelse: string;
  sporsmal: ISporsmal;
  nesteMeldekortId: Number | undefined;
  nesteEtterregistrerteMeldekortId: Number | undefined;
  nesteMeldekortKanSendes: string | undefined;
}

export default function Kvittering(props: IProps) {
  const {
    innsendingstype,
    ytelsestypePostfix,
    meldegruppe,
    personInfo,
    fom,
    tom,
    begrunnelse,
    sporsmal,
    nesteMeldekortId,
    nesteEtterregistrerteMeldekortId,
    nesteMeldekortKanSendes
  } = props;

  const { tt } = useExtendedTranslation();

  const mottattDato = new Date(); // API returnerer ikke noe mottat dato og vi må bare ta nåværende tidspunkt

  const createButton = (to: string, text: string) => {
    return (
      <Button variant="primary" onClick={() => {
        window.location.replace(to);
      }}>{text}</Button>
    );
  };

  let nesteLink = <NavLink to={getEnv("MIN_SIDE_URL")}>{tt("tilbake.minSide")}</NavLink>;
  const mLink = createButton(`/send-meldekort/${nesteMeldekortId}`, tt("overskrift.nesteMeldekort"));
  const eLink = createButton(`/etterregistrering/${nesteEtterregistrerteMeldekortId}`, tt("overskrift.etterregistrertMeldekort"));

  if (innsendingstype === Innsendingstype.INNSENDING) {
    if (nesteMeldekortId) {
      nesteLink = mLink;
    } else if (nesteEtterregistrerteMeldekortId) {
      nesteLink = eLink;
    }
  } else if (innsendingstype === Innsendingstype.ETTERREGISTRERING) {
    if (nesteEtterregistrerteMeldekortId) {
      nesteLink = eLink;
    } else if (nesteMeldekortId) {
      nesteLink = mLink;
    }
  }

  if (
    ytelsestypePostfix === Ytelsestype.AAP &&
    nesteMeldekortId == undefined &&
    (window as any)["hj"]
  ) {
    window.hj("trigger", "meldekortAAP");
  } else if (ytelsestypePostfix === Ytelsestype.TILTAKSPENGER && (window as any)["hj"]) {
    window.hj("trigger", "meldekortTP");
  }

  loggAktivitet(
    "Viser kvittering",
    {
      arbeidssoker: sporsmal.arbeidssoker ? "ja" : "nei",
      meldegruppe: meldegruppe || "UKJENT",
      innsendingstype: innsendingstype || "UKJENT",
    }
  );
  loggAktivitet(
    "skjema fullført",
    {
      meldegruppe: meldegruppe || "UKJENT",
    }
  );

  return (
    <div>
      <BodyLong as="div" align="center" spacing className="onlyForPrint">
        <img src={nav} className="imgBig" alt="" />
        <br /><br />
        <h2 className="navds-heading navds-heading--medium">
          {parseHtml(tt("overskrift.meldekort.sendt"))}
        </h2>
      </BodyLong>

      <Alert variant="success" className="notForPrint">
        {parseHtml(tt("overskrift.meldekort.sendt"))}
      </Alert>

      <Box padding="4" />

      <Alert variant="info">
        {parseHtml(tt("sendt.klagerettigheterInfo" + ytelsestypePostfix))}
      </Alert>

      <Box padding="4" />

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
      {nesteMeldekortKanSendes && (
        <BodyLong size="large">
            <span>
              {parseHtml(
                tt("sendt.meldekortKanSendes"),
                [formaterDato(nesteMeldekortKanSendes)]
              )}
            </span>
        </BodyLong>
      )}

      <Box padding="6" />

      {
        innsendingstype === Innsendingstype.KORRIGERING &&
          <Begrunnelse begrunnelse={begrunnelse} ytelsestypePostfix={ytelsestypePostfix} />
      }

      <SporsmalOgSvar sporsmal={sporsmal} fom={fom} ytelsestypePostfix={ytelsestypePostfix} />

      <hr />

      <div className="ukelister">
        <Ukeliste dager={sporsmal.meldekortDager} ytelsestypePostfix={ytelsestypePostfix} fom={fom} fraDag={0}
                  tilDag={7} />

        <Ukeliste dager={sporsmal.meldekortDager} ytelsestypePostfix={ytelsestypePostfix} fom={fom} fraDag={7} />
      </div>

      <div className="buttons notForPrint">
        <RemixLink as="Button" variant="secondary" to="/tidligere-meldekort">
          {tt("sendt.linkTilTidligereMeldekort")}
        </RemixLink>
        {nesteLink}
      </div>
      <div className="centeredButtons notForPrint">
        <Button variant="tertiary" icon={<PrinterSmallFillIcon aria-hidden />} onClick={() => window.print()}>
          {tt("overskrift.skrivUt")}
        </Button>
      </div>
    </div>
  );
}
