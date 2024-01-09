import Sporsmal from "~/components/innsending/Sporsmal";
import Utfylling from "~/components/innsending/Utfylling";
import Bekreftelse from "~/components/innsending/Bekreftelse";
import Kvittering from "~/components/innsending/Kvittering";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Innsendingstype } from "~/models/innsendingstype";
import type { IPersonInfo } from "~/models/person";
import Sideoverskrift from "~/components/sideoverskrift/Sideoverskrift";
import { BodyLong, Box, Stepper } from "@navikt/ds-react";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/datoUtils";
import { byggBegrunnelseObjekt } from "~/utils/miscUtils";
import type { Jsonify } from "@remix-run/server-runtime/dist/jsonify";
import type { IMeldekort } from "~/models/meldekort";
import type { IMeldekortdetaljer } from "~/models/meldekortdetaljer";
import { finnYtelsestypePostfix } from "~/utils/meldekortUtils";
import styles from "~/components/sideinnhold/Sideinnhold.module.css";

interface IProps {
  innsendingstype: Innsendingstype;
  valgtMeldekort: Jsonify<IMeldekort>;
  meldekortdetaljer: Jsonify<IMeldekortdetaljer>;
  personInfo: IPersonInfo;
  melekortApiUrl: string;
  minSideUrl: string;
}

export default function Innsending(props: IProps) {
  const [activeStep, setActiveStep] = useState(1)

  const { innsendingstype, valgtMeldekort, meldekortdetaljer, melekortApiUrl, minSideUrl, personInfo } = props

  const fom = valgtMeldekort.meldeperiode.fra
  const tom = valgtMeldekort.meldeperiode.til
  const ytelsestypePostfix = finnYtelsestypePostfix(valgtMeldekort.meldegruppe)

  const { t } = useTranslation(fom)
  const [begrunnelse, setBegrunnelse] = useState("")
  const [nyeSporsmal, setNyeSporsmal] = useState(meldekortdetaljer.sporsmal)

  const steps = [
    "overskrift.steg1",
    "overskrift.steg2",
    "overskrift.steg3",
    "overskrift.steg4"
  ]

  const begrunnelseObjekt = byggBegrunnelseObjekt(t("korriger.begrunnelse.valg"))

  let innhold: JSX.Element

  if (activeStep === 1) {
    innhold = <Sporsmal innsendingstype={innsendingstype}
                        fom={fom}
                        ytelsestypePostfix={ytelsestypePostfix}
                        begrunnelse={begrunnelse}
                        setBegrunnelse={setBegrunnelse}
                        sporsmal={nyeSporsmal}
                        setSporsmal={setNyeSporsmal}
                        activeStep={activeStep}
                        setActiveStep={setActiveStep} />
  } else if (activeStep === 2) {
    innhold = <Utfylling sporsmal={nyeSporsmal}
                         setSporsmal={setNyeSporsmal}
                         fom={fom}
                         ytelsestypePostfix={ytelsestypePostfix}
                         meldegruppe={valgtMeldekort.meldegruppe}
                         activeStep={activeStep}
                         setActiveStep={setActiveStep} />
  } else if (activeStep === 3) {
    innhold = <Bekreftelse begrunnelse={(begrunnelseObjekt as any)[begrunnelse]}
                           sporsmal={nyeSporsmal}
                           valgtMeldekort={valgtMeldekort}
                           innsendingstype={innsendingstype}
                           melekortApiUrl={melekortApiUrl}
                           activeStep={activeStep}
                           setActiveStep={setActiveStep} />
  } else {
    innhold = <Kvittering minSideUrl={minSideUrl}
                          innsendingstype={innsendingstype}
                          ytelsestypePostfix={ytelsestypePostfix}
                          personInfo={personInfo}
                          fom={fom}
                          tom={tom}
                          begrunnelse={(begrunnelseObjekt as any)[begrunnelse]}
                          sporsmal={nyeSporsmal} />
  }

  return (
    <div className={styles.sideInnhold}>
      <BodyLong as="div" align="center" spacing>
        <div>{t("meldekort.for.perioden")}</div>
        <div>
          <h2 className="navds-heading navds-heading--large">
            {t("overskrift.uke")} {formaterPeriodeTilUkenummer(fom, tom)}
          </h2>
        </div>
        <div>{formaterPeriodeDato(fom, tom)}</div>
      </BodyLong>

      <Stepper
        aria-labelledby="stepper-heading"
        activeStep={activeStep}
        interactive={false}
        orientation="horizontal"
      >
        {
          steps.map(step => <Stepper.Step key={step} href="#">{t(step)}</Stepper.Step>)
        }
      </Stepper>

      <Box padding="8" />

      <Sideoverskrift tittel={t(steps[activeStep - 1])} />
      {innhold}
    </div>
  )
}
