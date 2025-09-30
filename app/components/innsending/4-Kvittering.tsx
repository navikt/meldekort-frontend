import { PrinterSmallFillIcon } from "@navikt/aksel-icons";
import { Alert, BodyLong, Box, Button } from "@navikt/ds-react";
import { DateTime } from "luxon";
import { NavLink } from "react-router";

import Begrunnelse from "~/components/begrunnelse/Begrunnelse";
import { ReactLink } from "~/components/ReactLink";
import SporsmalOgSvar from "~/components/sporsmalOgSvar/SporsmalOgSvar";
import Ukeliste from "~/components/ukeliste/Ukeliste";
import nav from "~/img/nav.svg";
import { Innsendingstype } from "~/models/innsendingstype";
import type { Meldegruppe } from "~/models/meldegruppe";
import type { IPersonInfo } from "~/models/person";
import type { ISporsmal } from "~/models/sporsmal";
import { formaterDato, formaterPeriodeDato, formaterPeriodeTilUkenummer, formaterTid } from "~/utils/datoUtils";
import { getEnv } from "~/utils/envUtils";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";
import { loggAktivitet } from "~/utils/umamiUtils";


interface IProps {
  innsendingstype: Innsendingstype;
  ytelsestypePostfix: string;
  meldegruppe: Meldegruppe;
  personInfo: IPersonInfo;
  fom: string;
  tom: string;
  begrunnelse: string;
  sporsmal: ISporsmal;
  nesteMeldekortId: number | undefined;
  nesteEtterregistrerteMeldekortId: number | undefined;
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
    nesteMeldekortKanSendes,
  } = props;

  const { tt } = useExtendedTranslation();

  const mottattDato = DateTime.now().setZone("Europe/Oslo"); // API returnerer ikke noe mottat dato og vi må bare ta nåværende tidspunkt

  const createButton = (to: string, text: string) => {
    return (
      <Button variant="primary" onClick={() => {
        window.location.replace(to);
      }}>{text}</Button>
    );
  };

  let nesteLink = <NavLink to={getEnv("MIN_SIDE_URL")}>{tt("tilbake.minSide")}</NavLink>;
  const mLink = createButton(`${getEnv("BASE_PATH")}/send-meldekort/${nesteMeldekortId}`, tt("overskrift.nesteMeldekort"));
  const eLink = createButton(`${getEnv("BASE_PATH")}/etterregistrer-meldekort/${nesteEtterregistrerteMeldekortId}`, tt("overskrift.etterregistrertMeldekort"));

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

  loggAktivitet(
    "Viser Kvittering",
    {
      arbeidssoker: sporsmal.arbeidssoker ? "ja" : "nei",
      meldegruppe: meldegruppe,
      innsendingstype: innsendingstype,
    },
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
          [formaterDato(mottattDato), formaterTid(mottattDato) + " CET"],
        )}
      </BodyLong>
      {nesteMeldekortKanSendes && (
        <BodyLong size="large">
            <span>
              {parseHtml(
                tt("sendt.meldekortKanSendes"),
                [formaterDato(nesteMeldekortKanSendes)],
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
        <ReactLink as="Button" variant="secondary" to={"/tidligere-meldekort"}>
          {tt("sendt.linkTilTidligereMeldekort")}
        </ReactLink>
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
