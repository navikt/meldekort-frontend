import type { ISporsmal, ISporsmalOgSvar } from "~/models/sporsmal";
import { sporsmalConfig } from "~/models/sporsmal";
import { nestePeriodeFormatert } from "~/utils/datoUtils";
import { Label } from "@navikt/ds-react";
import { formatHtmlMessage } from "~/utils/intlUtils";
import UtvidetInformasjon from "~/components/utvidetInformasjon/UtvidetInformasjon";
import { CheckmarkCircleIcon } from "@navikt/aksel-icons";
import { useTranslation } from "react-i18next";
import styles from "./SporsmalOgSvar.module.css";

interface IProps {
  sporsmal: ISporsmal;
  fom: string;
  ytelsestypePostfix: string;
}

export default function SporsmalOgSvar(props: IProps) {
  const { t } = useTranslation();
  const { sporsmal, fom, ytelsestypePostfix } = props

  const hentSvar = (spmid: string): ISporsmal | undefined => {
    for (const sporsmalKey in sporsmal) {
      if (sporsmalKey === spmid) {
        return (sporsmal as any)[sporsmalKey]
      }
    }

    return undefined
  }

  const nestePeriodeFormatertDato = nestePeriodeFormatert(fom)

  const sporsmalOgSvar: ISporsmalOgSvar[] = sporsmalConfig.map(sporsmalsObj => {
    return {
      kategori: sporsmalsObj.kategori,
      sporsmal: sporsmalsObj.sporsmal + ytelsestypePostfix,
      forklaring: sporsmalsObj.forklaring + ytelsestypePostfix,
      svar: hentSvar(sporsmalsObj.id),
      formatertDato: sporsmalsObj.kategori === "registrert" ? nestePeriodeFormatertDato : undefined,
    }
  })

  return sporsmalOgSvar.map((item) => {
    return (
      <div key={item.sporsmal} className={styles.sporsmalOgSvar}>
        <Label>
          {formatHtmlMessage(t(item.sporsmal))}
          {item.formatertDato ? <span>{item.formatertDato}?</span> : null}
        </Label>
        <UtvidetInformasjon innhold={formatHtmlMessage(t(item.forklaring))} />
        <div>
          <CheckmarkCircleIcon className={styles.checkmarkCircleIcon} />
          {
            item.svar ? formatHtmlMessage(t("diverse.ja")) : formatHtmlMessage(t("diverse.nei"))
          }
        </div>
      </div>
    )
  })
}
