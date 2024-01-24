import { useState } from "react";
import { useExtendedTranslation } from "~/utils/intlUtils";
import type { Innsendingstype } from "~/models/innsendingstype";
import type { IPersonInfo } from "~/models/person";
import Sideoverskrift from "~/components/sideoverskrift/Sideoverskrift";
import { BodyLong, Box, Stepper } from "@navikt/ds-react";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/datoUtils";
import { byggBegrunnelseObjekt } from "~/utils/miscUtils";
import type { Jsonify } from "@remix-run/server-runtime/dist/jsonify";
import type { IMeldekort } from "~/models/meldekort";
import type { ISporsmal } from "~/models/sporsmal";
import { finnYtelsestypePostfix } from "~/utils/meldekortUtils";
import Sporsmal from "~/components/innsending/1-Sporsmal";
import Utfylling from "~/components/innsending/2-Utfylling";
import Bekreftelse from "~/components/innsending/3-Bekreftelse";
import Kvittering from "~/components/innsending/4-Kvittering";
import styles from "~/components/sideinnhold/Sideinnhold.module.css";

interface IProps {
  innsendingstype: Innsendingstype;
  valgtMeldekort: Jsonify<IMeldekort>;
  nesteMeldekort?: Number | undefined;
  nesteEtterregistrerteMeldekort?: Number | undefined;
  sporsmal: Jsonify<ISporsmal>;
  personInfo: IPersonInfo;
  melekortApiUrl: string;
  minSideUrl: string;
}

export default function Innsending(props: IProps) {
  const [activeStep, setActiveStep] = useState(1)

  const {
    innsendingstype,
    valgtMeldekort,
    sporsmal,
    melekortApiUrl,
    minSideUrl,
    personInfo,
    nesteMeldekort,
    nesteEtterregistrerteMeldekort
  } = props

  const fom = valgtMeldekort.meldeperiode.fra
  const tom = valgtMeldekort.meldeperiode.til
  const ytelsestypePostfix = finnYtelsestypePostfix(valgtMeldekort.meldegruppe)

  const { tt } = useExtendedTranslation()
  const [begrunnelse, setBegrunnelse] = useState("")
  const [nyeSporsmal, setNyeSporsmal] = useState(sporsmal)

  const steps = [
    "overskrift.steg1",
    "overskrift.steg2",
    "overskrift.steg3",
    "overskrift.steg4"
  ]

  const begrunnelseObjekt = byggBegrunnelseObjekt(tt("korriger.begrunnelse.valg"))

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
                          sporsmal={nyeSporsmal}
                          nesteMeldekort={nesteMeldekort}
                          nesteEtterregistrerteMeldekort={nesteEtterregistrerteMeldekort} />
  }

  return (
    <div className={styles.sideInnhold}>
      <BodyLong as="div" align="center" spacing>
        <div>{tt("meldekort.for.perioden")}</div>
        <div>
          <h2 className="navds-heading navds-heading--large">
            {tt("overskrift.uke")} {formaterPeriodeTilUkenummer(fom, tom)}
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
          steps.map(step => <Stepper.Step key={step} href="#">{tt(step)}</Stepper.Step>)
        }
      </Stepper>

      <Box padding="8" />

      <Sideoverskrift tittel={tt(steps[activeStep - 1])} />
      {innhold}
    </div>
  )
}
