import type { IMeldekortDag } from "~/models/sporsmal";
import { Label } from "@navikt/ds-react";
import UtvidetInformasjon from "~/components/utvidetInformasjon/UtvidetInformasjon";
import type { TTFunction } from "~/utils/intlUtils";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";
import { ukeFormatert } from "~/utils/datoUtils";
import styles from "./Ukeliste.module.css";
import { ukeDager } from "~/utils/miscUtils";


interface IProps {
  dager: IMeldekortDag[];
  ytelsestypePostfix: string;
  fom: string;
  fraDag: number;
  tilDag?: number;
}

export default function Ukeliste(props: IProps) {
  const { tt } = useExtendedTranslation();
  const { dager, fom, fraDag, tilDag, ytelsestypePostfix } = props

  return <div className={styles.ukeliste}>
    <h3 className={styles.ukeTittel}>{tt("overskrift.uke")} {ukeFormatert(fom, fraDag)}</h3>
    <hr className={styles.ukeTittelDelimiter} />

    {
      formaterUke(tt, dager, fraDag, tilDag, ytelsestypePostfix)
    }

    <hr />
  </div>
}

function formaterUke(tt: TTFunction, dager: IMeldekortDag[], fraDag: number, tilDag: number | undefined, ytelsestypePostfix: string) {
  const ukedager = ukeDager()

  return dager.slice(fraDag, tilDag).map((dag) => {
    const harAktivitet = dag.arbeidetTimerSum > 0 || dag.kurs || dag.annetFravaer || dag.syk
    const ukedag = dag.dag <= 7 ? ukedager[dag.dag - 1] : ukedager[dag.dag - 8]
    if (harAktivitet) {
      return (
        <div key={"dag" + dag.dag} className={styles.dag}>
          <Label data-testid={"label" + dag.dag}>{ukedag}:</Label>
          <span> </span>
          <span data-testid={"aktivitet" + dag.dag}>
            {
              [
                dag.arbeidetTimerSum ? `${tt("utfylling.arbeid")} ${dag.arbeidetTimerSum} ${tt("overskrift.timer").trim()}` : "",
                dag.kurs ? tt("utfylling.tiltak").trim() : "",
                dag.syk ? tt("utfylling.syk").trim() : "",
                dag.annetFravaer ? tt("utfylling.ferieFravar").trim() : ""
              ].filter(Boolean).join(", ")
            }
          </span>
          <UtvidetInformasjon innhold={hentDagsdata(tt, dag, ytelsestypePostfix)} />
        </div>
      )
    } else {
      return null
    }
  })
}

function hentDagsdata(tt: TTFunction, dag: IMeldekortDag, ytelsestypePostfix: string) {
  const innhold = []

  if (dag.arbeidetTimerSum > 0) {
    innhold.push(formaterDagsdata(tt, "utfylling.arbeid", "forklaring.utfylling.arbeid" + ytelsestypePostfix))
  }

  if (dag.kurs) {
    innhold.push(formaterDagsdata(tt, "utfylling.tiltak", "forklaring.utfylling.tiltak" + ytelsestypePostfix))
  }
  if (dag.syk) {
    innhold.push(formaterDagsdata(tt, "utfylling.syk", "forklaring.utfylling.syk" + ytelsestypePostfix))
  }

  if (dag.annetFravaer) {
    innhold.push(formaterDagsdata(tt, "utfylling.ferieFravar", "forklaring.utfylling.ferieFravar" + ytelsestypePostfix))
  }

  return <div key={"dagInfo" + dag.dag}>{innhold}</div>
}

function formaterDagsdata(tt: TTFunction, utfyllingTekstid: string, forklaringTekstid: string) {
  return <div key={utfyllingTekstid}>
    <Label>{tt(utfyllingTekstid).toUpperCase()}</Label><br />
    {parseHtml(tt(forklaringTekstid))}<br /><br />
  </div>
}
