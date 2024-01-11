import type { ISporsmal } from "~/models/sporsmal";
import type { Jsonify } from "@remix-run/server-runtime/dist/jsonify";
import type { IMeldekort } from "~/models/meldekort";
import { Innsendingstype } from "~/models/innsendingstype";
import { finnYtelsestypePostfix } from "~/utils/meldekortUtils";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import type { IFravaerInnsending, IMeldekortdetaljerInnsending } from "~/models/meldekortdetaljerInnsending";
import { FravaerTypeInnsending, sendInnMeldekort } from "~/models/meldekortdetaljerInnsending";
import { Alert, Box, Button, ConfirmationPanel } from "@navikt/ds-react";
import { parseHtml } from "~/utils/intlUtils";
import Begrunnelse from "~/components/begrunnelse/Begrunnelse";
import SporsmalOgSvar from "~/components/sporsmalOgSvar/SporsmalOgSvar";
import Ukeliste from "~/components/ukeliste/Ukeliste";
import { RemixLink } from "~/components/RemixLink";

interface IProps {
  begrunnelse: string;
  sporsmal: ISporsmal;
  valgtMeldekort: Jsonify<IMeldekort>;
  innsendingstype: Innsendingstype;
  melekortApiUrl: string;
  activeStep: number;
  setActiveStep: Function;
}

export default function Bekreftelse(props: IProps) {
  const { begrunnelse, sporsmal, valgtMeldekort, innsendingstype, melekortApiUrl, activeStep, setActiveStep } = props

  const fom = valgtMeldekort.meldeperiode.fra
  const ytelsestypePostfix = finnYtelsestypePostfix(valgtMeldekort.meldegruppe)

  const { t } = useTranslation()

  const [bekreftet, setBekreftet] = useState(false)
  const [visFeil, setVisFeil] = useState(false)

  const hentFravaersdager = () => {
    const fravar: IFravaerInnsending[] = [];
    sporsmal.meldekortDager.forEach(meldekortDag => {
      if (Number(meldekortDag.arbeidetTimerSum) > 0) {
        fravar.push({
          dagIndeks: meldekortDag.dag,
          type: { typeFravaer: FravaerTypeInnsending.ARBEIDS_FRAVAER },
          arbeidTimer: meldekortDag.arbeidetTimerSum,
        });
      }

      if (meldekortDag.syk) {
        fravar.push({
          dagIndeks: meldekortDag.dag,
          type: { typeFravaer: FravaerTypeInnsending.SYKDOM },
        });
      }

      if (meldekortDag.kurs) {
        fravar.push({
          dagIndeks: meldekortDag.dag,
          type: { typeFravaer: FravaerTypeInnsending.KURS_UTDANNING },
        });
      }

      if (meldekortDag.annetFravaer) {
        fravar.push({
          dagIndeks: meldekortDag.dag,
          type: { typeFravaer: FravaerTypeInnsending.ANNET_FRAVAER },
        });
      }
    });
    return fravar;
  }

  const tilbake = () => {
    if (!sporsmal.arbeidet && !sporsmal.kurs && !sporsmal.syk && !sporsmal.annetFravaer) setActiveStep(activeStep - 2)
    else setActiveStep(activeStep - 1)
  }

  const validerOgVidere = () => {
    if (!bekreftet) {
      setVisFeil(true)
    } else {
      // Send
      const meldekortdetaljer: IMeldekortdetaljerInnsending = {
        begrunnelse: begrunnelse,
        erArbeidssokerNestePeriode: !!sporsmal.arbeidssoker,
        fravaersdager: hentFravaersdager(),
        korrigerbart: innsendingstype !== Innsendingstype.KORRIGERING,
        kortStatus: valgtMeldekort.kortStatus,
        kortType: valgtMeldekort.kortType,
        meldegruppe: valgtMeldekort.meldegruppe,
        meldekortId: valgtMeldekort.meldekortId,
        meldeperiode: valgtMeldekort.meldeperiode,
        mottattDato: new Date(),
        sesjonsId: "IKKE I BRUK",
        signatur: true, // Vi sender ikke uten brukerens samtykke
        sporsmalsobjekter: []
      }
      sendInnMeldekort(melekortApiUrl, meldekortdetaljer)
        .then(response => {
          if (response.ok) setActiveStep(activeStep + 1)
          else {
            console.log(response.status + " " + response.statusText)
          }
        })
        .catch((error) => console.log(error))
    }
  }

  return (
    <div>
      <Alert variant="warning">
        {parseHtml(t("overskrift.steg3.info.ikkeSendt"))}
        {parseHtml(t("overskrift.steg3.info.bekreftVerdier"))}
      </Alert>

      <Box padding="4" />

      <Begrunnelse begrunnelse={begrunnelse} />

      <SporsmalOgSvar sporsmal={sporsmal} fom={fom} ytelsestypePostfix={ytelsestypePostfix} />

      <hr />

      <Ukeliste dager={sporsmal.meldekortDager} ytelsestypePostfix={ytelsestypePostfix} fom={fom} fraDag={0} tilDag={7} />

      <Ukeliste dager={sporsmal.meldekortDager} ytelsestypePostfix={ytelsestypePostfix} fom={fom} fraDag={7} />

      <ConfirmationPanel
        label={t("utfylling.bekreftAnsvar")}
        checked={bekreftet}
        onChange={() => setBekreftet((bekreftet) => !bekreftet)}
        error={!bekreftet && visFeil && t("utfylling.bekreft.feil")}
      >
        {parseHtml(t("utfylling.bekreft"))}
      </ConfirmationPanel>

      <Box padding="6" />

      <div className="buttons">
        <Button variant="secondary" onClick={() => tilbake()}>{t("naviger.forrige")}</Button>
        <Button variant="primary" onClick={() => validerOgVidere()}>{t("naviger.send")}</Button>
      </div>
      <div className="centeredButtons">
        <RemixLink as="Button" variant="tertiary" to="/tidligere-meldekort">
          {t("naviger.avbryt")}
        </RemixLink>
      </div>
    </div>
  )
}
