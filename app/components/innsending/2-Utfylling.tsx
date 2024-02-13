import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { Accordion, Alert, Button, Checkbox, Heading, TextField } from "@navikt/ds-react";
import { RemixLink } from "~/components/RemixLink";
import type { ISporsmal } from "~/models/sporsmal";
import { ukeFormatert } from "~/utils/datoUtils";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";
import UtvidetInformasjon from "~/components/utvidetInformasjon/UtvidetInformasjon";
import { Meldegruppe } from "~/models/meldegruppe";
import styles from "./Innsending.module.css";
import { ukeDager } from "~/utils/miscUtils";
import { useFetcherWithPromise } from "~/utils/fetchUtils";
import type { ISendInnMeldekortActionResponse } from "~/models/meldekortdetaljerInnsending";
import classNames from "classnames";

interface IProps {
  sporsmal: ISporsmal;
  setSporsmal: Dispatch<SetStateAction<ISporsmal>>;
  fom: string;
  ytelsestypePostfix: string;
  meldegruppe: Meldegruppe;
  activeStep: number;
  setActiveStep: Function;
}

export default function Utfylling(props: IProps) {
  const { fom, sporsmal, setSporsmal, ytelsestypePostfix, meldegruppe, activeStep, setActiveStep } = props

  const { tt } = useExtendedTranslation()

  const fetcher = useFetcherWithPromise<ISendInnMeldekortActionResponse>({ key: "sendInnMeldekort" })
  const innsending = fetcher.data?.innsending

  const [visFeil, setVisFeil] = useState(false)
  const [feilDager, setFeilDager] = useState<string[]>([])
  const [feilIArbeid, setFeilIArbeid] = useState(false)
  const [feilIKurs, setFeilIKurs] = useState(false)
  const [feilISyk, setFeilISyk] = useState(false)
  const [feilIAnnetFravaer, setFeilIAnnetFravaer] = useState(false)
  const [feilIArbeidetTimerHeleHalve, setFeilIArbeidetTimerHeleHalve] = useState(false)
  const [feilIArbeidetTimer, setFeilIArbeidetTimer] = useState(false)
  const [feilKombinasjonSykArbeid, setFeilKombinasjonSykArbeid] = useState(false)
  const [feilKombinasjonFravaerArbeid, setFeilKombinasjonFravaerArbeid] = useState(false)
  const [feilKombinasjonFravaerSyk, setFeilKombinasjonFravaerSyk] = useState(false)

  const ukedager = ukeDager()

  const oppdaterSvar = (value: string | boolean, index: number, spObjKey: string) => {
    const tmpSporsmal: any = { ...sporsmal }
    tmpSporsmal.meldekortDager[index][spObjKey] = value
    setSporsmal(tmpSporsmal)
  }

  const opprettDag = (dag: string) => {
    return (
      <div className={styles.placeholder}>
        <abbr key={"ukedager-" + dag} title={dag}>
          {dag.toUpperCase()[0]}
        </abbr>
      </div>
    )
  }

  const opprettArbeidsrad = (plussDager: number) => {
    return <div className={styles.rad}>
      <div className={classNames(styles.tittel, styles.arbeid)}>
        <Heading level="4" size="small">{tt("utfylling.arbeid")}</Heading>
      </div>
      <div className={classNames(styles.info, styles.arbeid)}>
        <UtvidetInformasjon innhold={parseHtml(tt("forklaring.utfylling.arbeid" + ytelsestypePostfix))} />
      </div>
      <div className={styles.grid}>
        <div className={classNames(styles.placeholder, styles.arbeid)}></div>
        {
          ukedager.map((dag, index) => {
            return <div key={"arbeid" + index} className={styles.centered}>
              {opprettDag(dag)}
              <TextField label=""
                         hideLabel
                         className={styles.input}
                         value={((sporsmal as any).meldekortDager[index + plussDager] || {})["arbeidetTimerSum"] || ""}
                         onChange={(event) => oppdaterSvar(event.target.value, index + plussDager, "arbeidetTimerSum")}
                         error={feilDager.includes("arbeid" + (index + plussDager + 1))}
                         data-testid={"arbeid" + (index + plussDager + 1)}
              />
            </div>
          })
        }
      </div>
    </div>
  }

  const opprettAktivitetsrad = (type: string, spObjKey: string, plussDager: number) => {
    return <div className={styles.rad}>
      <div className={classNames(styles.tittel, styles[type])}>
        <Heading level="4" size="small">{tt(`utfylling.${type}`)}</Heading>
      </div>
      <div className={classNames(styles.info, styles[type])}>
        <UtvidetInformasjon innhold={parseHtml(tt(`forklaring.utfylling.${type}${ytelsestypePostfix}`))} />
      </div>
      <div className={styles.grid}>
        <div className={classNames(styles.placeholder, styles[type])}></div>
        {
          ukedager.map((dag, index) => {
            return <div key={type + index} className={styles.centered}>
              {opprettDag(dag)}
              <Checkbox hideLabel
                        onChange={(event) => oppdaterSvar(event.target.checked, index + plussDager, spObjKey)}
                        checked={((sporsmal as any).meldekortDager[index + plussDager] || {})[spObjKey] === true}
                        error={feilDager.includes(spObjKey + (index + plussDager + 1))}
                        data-testid={spObjKey + (index + plussDager + 1)}
              >
                _
              </Checkbox>
            </div>
          })
        }
      </div>
    </div>
  }

  const opprettUke = (plussDager: number) => {
    return <Accordion.Item defaultOpen className={styles.uke}>
      <Accordion.Header>{tt("overskrift.uke")} {ukeFormatert(fom, plussDager)}</Accordion.Header>
      <Accordion.Content>
        <div>
          <div className={classNames(styles.rad, styles.desktop)}>
            <div className={styles.grid}>
              {
                ukedager.map((dag) => {
                  return <div key={dag} className={styles.centered}>
                    <abbr key={"ukedager-" + dag} title={dag}>
                      {dag.toUpperCase()[0]}
                    </abbr>
                  </div>
                })
              }
            </div>
          </div>
          {
            sporsmal.arbeidet && opprettArbeidsrad(plussDager)
          }
          {
            sporsmal.kurs && opprettAktivitetsrad("tiltak", "kurs", plussDager)
          }
          {
            sporsmal.syk && opprettAktivitetsrad("syk", "syk", plussDager)
          }
          {
            sporsmal.annetFravaer && opprettAktivitetsrad("ferieFravar", "annetFravaer", plussDager)
          }
        </div>
      </Accordion.Content>
    </Accordion.Item>
  }

  const tilbake = () => {
    window.scrollTo(0, 0)
    setActiveStep(activeStep - 1)
  }

  const validerOgVidere = () => {
    // Reset
    let feilDager: string[] = []
    setFeilDager([])
    setFeilIArbeid(false)
    setFeilIKurs(false)
    setFeilISyk(false)
    setFeilIAnnetFravaer(false)
    setFeilIArbeidetTimerHeleHalve(false)
    setFeilIArbeidetTimer(false)
    setFeilKombinasjonSykArbeid(false)
    setFeilKombinasjonFravaerArbeid(false)
    setFeilKombinasjonFravaerSyk(false)

    let arbeid = false
    let kurs = false
    let syk = false
    let annetFravaer = false

    // Sjekk
    sporsmal.meldekortDager.forEach(dag => {
      // Sjekk at brukeren jobbet eller hadde kurs eller var syk eller hadde annet fravaer minst én dag hvis det tilsvarende spørsmålet er JA
      if (Number(dag.arbeidetTimerSum) > 0) {
        arbeid = true
      }
      if (dag.kurs) {
        kurs = true
      }
      if (dag.syk) {
        syk = true
      }
      if (dag.annetFravaer) {
        annetFravaer = true
      }

      // Sjekk at brukeren har skrevet inn gyldige verdier for arbeidstid
      if (sporsmal.arbeidet && dag.arbeidetTimerSum) {
        if ((Number(dag.arbeidetTimerSum) * 2) % 1 !== 0) {
          feilDager.push("arbeid" + dag.dag)
          setFeilIArbeidetTimerHeleHalve(true)
        } else if (Number(dag.arbeidetTimerSum) > 24 || Number(dag.arbeidetTimerSum) < 0) {
          feilDager.push("arbeid" + dag.dag)
          setFeilIArbeidetTimer(true)
        }
      }

      if (meldegruppe === Meldegruppe.DAGP) {
        // Sjekk at brukeren ikke jobbet og ikke var syk samme dag
        if (Number(dag.arbeidetTimerSum) > 0 && dag.syk) {
          feilDager.push("arbeid" + dag.dag)
          feilDager.push("syk" + dag.dag)
          setFeilKombinasjonSykArbeid(true)
        }

        // Sjekk at brukeren ikke jobbet og ikke hadde annet fravaer samme dag
        if (Number(dag.arbeidetTimerSum) > 0 && dag.annetFravaer) {
          feilDager.push("arbeid" + dag.dag)
          feilDager.push("annetFravaer" + dag.dag)
          setFeilKombinasjonFravaerArbeid(true)
        }
      } else if (meldegruppe === Meldegruppe.ATTF) {
        // Sjekk at brukeren ikke jobbet og ikke hadde annet fravaer samme dag
        if (Number(dag.arbeidetTimerSum) > 0 && dag.annetFravaer) {
          feilDager.push("arbeid" + dag.dag)
          feilDager.push("annetFravaer" + dag.dag)
          setFeilKombinasjonFravaerArbeid(true)
        }

        // Sjekk at brukeren ikke var syk og ikke hadde annet fravaer samme dag
        if (dag.syk && dag.annetFravaer) {
          feilDager.push("syk" + dag.dag)
          feilDager.push("annetFravaer" + dag.dag)
          setFeilKombinasjonFravaerSyk(true)
        }
      } else if (meldegruppe === Meldegruppe.INDIV) {
        // Sjekk at brukeren ikke var syk og ikke hadde annet fravaer samme dag
        if (dag.syk && dag.annetFravaer) {
          feilDager.push("syk" + dag.dag)
          feilDager.push("annetFravaer" + dag.dag)
          setFeilKombinasjonFravaerSyk(true)
        }
      }
    });

    if (sporsmal.arbeidet && !arbeid) {
      setFeilIArbeid(true)
      for (let i = 1; i <= 14; i++) feilDager.push("arbeid" + i)
    }
    if (sporsmal.kurs && !kurs) {
      setFeilIKurs(true)
      for (let i = 1; i <= 14; i++) feilDager.push("kurs" + i)
    }
    if (sporsmal.syk && !syk) {
      setFeilISyk(true)
      for (let i = 1; i <= 14; i++) feilDager.push("syk" + i)
    }
    if (sporsmal.annetFravaer && !annetFravaer) {
      setFeilIAnnetFravaer(true)
      for (let i = 1; i <= 14; i++) feilDager.push("annetFravaer" + i)
    }

    window.scrollTo(0, 0)

    // Hvis det finnes noen dager med feil, vis disse dagene
    // Ellers fortsett
    if (feilDager.length > 0) {
      setVisFeil(true)
      setFeilDager(feilDager)
    } else {
      setActiveStep(activeStep + 1)
    }
  }

  return (
    <div>
      {
        (visFeil || innsending?.arsakskoder?.length) &&
          <Alert variant="error" className={styles.error}>
              <ul>
                {
                  feilIArbeid
                    ? <li>{parseHtml(tt("utfylling.mangler.arbeid"))}</li>
                    : null
                }
                {
                  feilIKurs
                    ? <li>{parseHtml(tt("utfylling.mangler.tiltak"))}</li>
                    : null
                }
                {
                  feilISyk
                    ? <li>{parseHtml(tt("utfylling.mangler.syk"))}</li>
                    : null
                }
                {
                  feilIAnnetFravaer
                    ? <li>{parseHtml(tt("utfylling.mangler.ferieFravar"))}</li>
                    : null
                }
                {
                  feilIArbeidetTimerHeleHalve
                    ? <li>{parseHtml(tt("arbeidTimer.heleEllerHalveTallValidator"))}</li>
                    : null
                }
                {
                  feilIArbeidetTimer
                    ? <li>{parseHtml(tt("arbeidTimer.rangeValidator.range"))}</li>
                    : null
                }
                {
                  feilKombinasjonSykArbeid
                    ? <li>{parseHtml(tt("arbeidTimer.kombinasjonSykArbeidValidator"))}</li>
                    : null
                }
                {
                  feilKombinasjonFravaerArbeid
                    ? <li>{parseHtml(tt("arbeidTimer.kombinasjonFravaerArbeidValidator"))}</li>
                    : null
                }
                {
                  feilKombinasjonFravaerSyk
                    ? <li>{parseHtml(tt("arbeidTimer.kombinasjonFravaerSykValidator"))}</li>
                    : null
                }
                {
                  innsending?.arsakskoder?.map(arsakskode => {
                    return <li key={arsakskode.kode}>
                      {
                        parseHtml(
                          tt("meldekortkontroll.feilkode." + arsakskode.kode.toLowerCase()),
                          arsakskode.params
                        )
                      }
                    </li>
                  })
                }
              </ul>
          </Alert>
      }
      <Accordion headingSize="large">
        {opprettUke(0)}
        {opprettUke(7)}
      </Accordion>

      <div className="buttons">
        <Button variant="secondary" onClick={() => tilbake()}>{tt("naviger.forrige")}</Button>
        <Button variant="primary" onClick={() => validerOgVidere()}>{tt("naviger.neste")}</Button>
      </div>
      <div className="centeredButtons">
        <RemixLink as="Button" variant="tertiary" to="/tidligere-meldekort">
          {tt("naviger.avbryt")}
        </RemixLink>
      </div>
    </div>
  )
}
