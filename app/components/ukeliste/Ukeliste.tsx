import type { IMeldekortDag } from "~/models/sporsmal";
import { Label } from "@navikt/ds-react";
import UtvidetInformasjon from "~/components/utvidetInformasjon/UtvidetInformasjon";
import type { TTFunction} from "~/utils/intlUtils";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";
import { ukeFormatert } from "~/utils/datoUtils";
import styles from "./Ukeliste.module.css";

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
      formaterUke(dager, fraDag, tilDag, ytelsestypePostfix, tt)
    }

    <hr />
  </div>
}

function formaterUke(dager: IMeldekortDag[], fraDag: number, tilDag: number | undefined, ytelsestypePostfix: string, tt: TTFunction) {
  const ukedager = [
    tt("ukedag.mandag").trim(),
    tt("ukedag.tirsdag").trim(),
    tt("ukedag.onsdag").trim(),
    tt("ukedag.torsdag").trim(),
    tt("ukedag.fredag").trim(),
    tt("ukedag.lordag").trim(),
    tt("ukedag.sondag").trim(),
  ]

  return dager.slice(fraDag, tilDag).map((dag) => {
    const harAktivitet = dag.arbeidetTimerSum > 0 || dag.kurs || dag.annetFravaer || dag.syk
    const ukedag = dag.dag <= 7 ? ukedager[dag.dag - 1] : ukedager[dag.dag - 8]
    if (harAktivitet) {
      return (
        <div key={"dag" + dag.dag} className={styles.dag}>
          <Label>{ukedag}:</Label>
          <span> </span>
          {
            [
              dag.arbeidetTimerSum ? `${tt("utfylling.arbeid")} ${dag.arbeidetTimerSum} ${tt("overskrift.timer").trim()}` : "",
              dag.kurs ? tt("utfylling.tiltak").trim() : "",
              dag.syk ? tt("utfylling.syk").trim() : "",
              dag.annetFravaer ? tt("utfylling.ferieFravar").trim() : ""
            ].filter(Boolean).join(", ")
          }
          <UtvidetInformasjon innhold={hentDagsdata(dag, ytelsestypePostfix, tt)} />
        </div>
      )
    } else {
      return null
    }
  })
}

function hentDagsdata(dag: IMeldekortDag, ytelsestypePostfix: string, tt: TTFunction) {
  const innhold = []

  if (dag.arbeidetTimerSum > 0) {
    innhold.push(formaterDagsdata("utfylling.arbeid", "forklaring.utfylling.arbeid" + ytelsestypePostfix, tt))
  }

  if (dag.kurs) {
    innhold.push(formaterDagsdata("utfylling.tiltak", "forklaring.utfylling.tiltak" + ytelsestypePostfix, tt))
  }

  if (dag.syk) {
    innhold.push(formaterDagsdata("utfylling.syk", "forklaring.utfylling.syk" + ytelsestypePostfix, tt))
  }

  if (dag.annetFravaer) {
    innhold.push(formaterDagsdata("utfylling.ferieFravar", "forklaring.utfylling.ferieFravar" + ytelsestypePostfix, tt))
  }

  return <div key={"dagInfo" + dag.dag}>{innhold}</div>
}

function formaterDagsdata(utfyllingTekstid: string, forklaringTekstid: string, tt: TTFunction) {
  return <div key={utfyllingTekstid}>
    <Label>{tt(utfyllingTekstid).toUpperCase()}</Label><br />
    {parseHtml(tt(forklaringTekstid))}<br /><br />
  </div>
}
