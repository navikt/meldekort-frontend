import type { ISporsmal } from "~/models/sporsmal";
import type { Jsonify } from "@remix-run/server-runtime/dist/jsonify";
import type { IMeldekort } from "~/models/meldekort";
import { Innsendingstype } from "~/models/innsendingstype";
import { finnYtelsestypePostfix } from "~/utils/meldekortUtils";
import { useEffect, useState } from "react";
import type { IFravaerInnsending, IMeldekortdetaljerInnsending } from "~/models/meldekortdetaljerInnsending";
import { FravaerTypeInnsending } from "~/models/meldekortdetaljerInnsending";
import { Alert, Box, Button, ConfirmationPanel } from "@navikt/ds-react";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";
import Begrunnelse from "~/components/begrunnelse/Begrunnelse";
import SporsmalOgSvar from "~/components/sporsmalOgSvar/SporsmalOgSvar";
import Ukeliste from "~/components/ukeliste/Ukeliste";
import { RemixLink } from "~/components/RemixLink";
import { useActionData, useSubmit } from "@remix-run/react";
import type { action } from "~/routes/etterregistrering.$meldekortId";
import { opprettSporsmalsobjekter } from "~/utils/sporsmalsobjekterUtils";

interface IProps {
  begrunnelse: string;
  sporsmal: ISporsmal;
  valgtMeldekort: Jsonify<IMeldekort>;
  innsendingstype: Innsendingstype;
  activeStep: number;
  setActiveStep: Function;
  nesteMeldekortKanSendes: string | undefined;
}

export default function Bekreftelse(props: IProps) {
  const {
    begrunnelse,
    sporsmal,
    valgtMeldekort,
    innsendingstype,
    activeStep,
    setActiveStep,
    nesteMeldekortKanSendes
  } = props

  const actionData = useActionData<typeof action>() // TODO: Action fra..?
  const baksystemFeil = actionData?.baksystemFeil
  const innsending = actionData?.innsending

  // Vi bruker useEffect for å sjekke data etter at vi sender meldekort
  // Hvis innsending er OK, kan vi vise Kvittering
  // Hvis innsending ikke er OK, går vi tilbake til Utfylling
  useEffect(() => {
    if (innsending?.status === "OK") {
      setActiveStep(activeStep + 1)
    } else if (innsending?.status === "FEIL") {
      setActiveStep(activeStep - 1)
    }
  }, [innsending, activeStep, setActiveStep]);

  const { tt } = useExtendedTranslation()
  const submit = useSubmit()

  const [bekreftet, setBekreftet] = useState(false)
  const [loading, setLoading] = useState(false)
  const [visFeil, setVisFeil] = useState(false)

  const fom = valgtMeldekort.meldeperiode.fra
  const ytelsestypePostfix = finnYtelsestypePostfix(valgtMeldekort.meldegruppe)

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
    document.documentElement.scrollTo(0, 0)

    if (!sporsmal.arbeidet && !sporsmal.kurs && !sporsmal.syk && !sporsmal.annetFravaer) setActiveStep(activeStep - 2)
    else setActiveStep(activeStep - 1)
  }

  const validerOgVidere = () => {
    if (!bekreftet) {
      setVisFeil(true)
    } else {
      // Send
      setLoading(true)

      const mottattDato = new Date()

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
        mottattDato: mottattDato,
        sesjonsId: "IKKE I BRUK",
        signatur: true, // Vi sender ikke uten brukerens samtykke
        sporsmalsobjekter: opprettSporsmalsobjekter(valgtMeldekort, innsendingstype, begrunnelse, sporsmal, mottattDato, nesteMeldekortKanSendes) // Her samler vi alt bruker har sett for å lagre i Dokarkiv
      }

      const formData = new FormData()
      formData.append("meldekortdetaljer", JSON.stringify(meldekortdetaljer))
      submit(formData, { method: "post" })
    }
  }

  return (
    <div>
      <Alert variant="warning">
        {parseHtml(tt("overskrift.steg3.info.ikkeSendt"))}
        {parseHtml(tt("overskrift.steg3.info.bekreftVerdier"))}
      </Alert>

      <Box padding="4" />

      {
        innsendingstype === Innsendingstype.KORRIGERING && <Begrunnelse begrunnelse={begrunnelse} />
      }

      <SporsmalOgSvar sporsmal={sporsmal} fom={fom} ytelsestypePostfix={ytelsestypePostfix} />

      <hr />

      <Ukeliste dager={sporsmal.meldekortDager} ytelsestypePostfix={ytelsestypePostfix} fom={fom} fraDag={0} tilDag={7} />

      <Ukeliste dager={sporsmal.meldekortDager} ytelsestypePostfix={ytelsestypePostfix} fom={fom} fraDag={7} />

      <ConfirmationPanel
        label={tt("utfylling.bekreftAnsvar")}
        checked={bekreftet}
        onChange={() => setBekreftet((bekreftet) => !bekreftet)}
        error={!bekreftet && visFeil && tt("utfylling.bekreft.feil")}
      >
        {parseHtml(tt("utfylling.bekreft"))}
      </ConfirmationPanel>

      {baksystemFeil &&
          <div>
              <Box padding="4" />

              <Alert variant="error">
                {parseHtml(tt("meldekortkontroll.feilkode.00"))}
              </Alert>
          </div>
      }

      <div className="buttons">
        <Button variant="secondary" onClick={() => tilbake()}>{tt("naviger.forrige")}</Button>
        <Button variant="primary" loading={loading} onClick={() => validerOgVidere()}>{tt("naviger.send")}</Button>
      </div>
      <div className="centeredButtons">
        <RemixLink as="Button" variant="tertiary" to="/tidligere-meldekort">
          {tt("naviger.avbryt")}
        </RemixLink>
      </div>
    </div>
  )
}
