import type { IMeldekortDag } from "~/models/sporsmal";
import { Label } from "@navikt/ds-react";
import UtvidetInformasjon from "~/components/utvidetInformasjon/UtvidetInformasjon";
import type { TFunction } from "i18next";
import { parseHtml } from "~/utils/intlUtils";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { dager, fom, fraDag, tilDag, ytelsestypePostfix } = props

  return <div className={styles.ukeliste}>
    <h3 className={styles.ukeTittel}>{t("overskrift.uke")} {ukeFormatert(fom, fraDag)}</h3>
    <hr className={styles.ukeTittelDelimiter} />

    {
      formaterUke(dager, fraDag, tilDag, ytelsestypePostfix, t)
    }

    <hr />
  </div>
}

function formaterUke(dager: IMeldekortDag[], fraDag: number, tilDag: number | undefined, ytelsestypePostfix: string, t: TFunction) {
  const ukedager = [
    t("ukedag.mandag").trim(),
    t("ukedag.tirsdag").trim(),
    t("ukedag.onsdag").trim(),
    t("ukedag.torsdag").trim(),
    t("ukedag.fredag").trim(),
    t("ukedag.lordag").trim(),
    t("ukedag.sondag").trim(),
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
              dag.arbeidetTimerSum ? `${t("utfylling.arbeid")} ${dag.arbeidetTimerSum} ${t("overskrift.timer").trim()}` : "",
              dag.kurs ? t("utfylling.tiltak").trim() : "",
              dag.syk ? t("utfylling.syk").trim() : "",
              dag.annetFravaer ? t("utfylling.ferieFravar").trim() : ""
            ].filter(Boolean).join(", ")
          }
          <UtvidetInformasjon innhold={hentDagsdata(dag, ytelsestypePostfix, t)} />
        </div>
      )
    } else {
      return null
    }
  })
}

function hentDagsdata(dag: IMeldekortDag, ytelsestypePostfix: string, t: TFunction) {
  const innhold = []

  if (dag.arbeidetTimerSum > 0) {
    innhold.push(formaterDagsdata("utfylling.arbeid", "forklaring.utfylling.arbeid" + ytelsestypePostfix, t))
  }

  if (dag.kurs) {
    innhold.push(formaterDagsdata("utfylling.tiltak", "forklaring.utfylling.tiltak" + ytelsestypePostfix, t))
  }

  if (dag.syk) {
    innhold.push(formaterDagsdata("utfylling.syk", "forklaring.utfylling.syk" + ytelsestypePostfix, t))
  }

  if (dag.annetFravaer) {
    innhold.push(formaterDagsdata("utfylling.ferieFravar", "forklaring.utfylling.ferieFravar" + ytelsestypePostfix, t))
  }

  return <div key={"dagInfo" + dag.dag}>{innhold}</div>
}

function formaterDagsdata(utfyllingTekstid: string, forklaringTekstid: string, t: TFunction) {
  return <div key={utfyllingTekstid}>
    <Label>{t(utfyllingTekstid).toUpperCase()}</Label><br />
    {parseHtml(t(forklaringTekstid))}<br /><br />
  </div>
}
