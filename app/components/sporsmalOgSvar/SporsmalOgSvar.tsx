import type { ISporsmal, ISporsmalOgSvar } from "~/models/sporsmal";
import { sporsmalConfig } from "~/models/sporsmal";
import { nestePeriodeFormatert } from "~/utils/datoUtils";
import { Box, Label } from "@navikt/ds-react";
import { parseHtml } from "~/utils/intlUtils";
import UtvidetInformasjon from "~/components/utvidetInformasjon/UtvidetInformasjon";
import { CheckmarkCircleIcon } from "@navikt/aksel-icons";
import { useTranslation } from "react-i18next";
import { hentSvar } from "~/utils/miscUtils";
import styles from "./SporsmalOgSvar.module.css";

interface IProps {
  sporsmal: ISporsmal;
  fom: string;
  ytelsestypePostfix: string;
}

export default function SporsmalOgSvar(props: IProps) {
  const { t } = useTranslation();
  const { sporsmal, fom, ytelsestypePostfix } = props

  const nestePeriodeFormatertDato = nestePeriodeFormatert(fom)

  const sporsmalOgSvar: ISporsmalOgSvar[] = sporsmalConfig.map(sporsmalsObj => {
    return {
      kategori: sporsmalsObj.kategori,
      sporsmal: sporsmalsObj.sporsmal + ytelsestypePostfix,
      forklaring: sporsmalsObj.forklaring + ytelsestypePostfix,
      svar: hentSvar(sporsmal, sporsmalsObj.id),
      formatertDato: sporsmalsObj.kategori === "registrert" ? nestePeriodeFormatertDato : undefined,
    }
  })

  return sporsmalOgSvar.map((item) => {
    return (
      <div key={item.sporsmal} className={styles.sporsmalOgSvar}>
        <Label>
          {parseHtml(t(item.sporsmal))}
          {item.formatertDato ? <span> {item.formatertDato}?</span> : null}
        </Label>
        <UtvidetInformasjon innhold={parseHtml(t(item.forklaring))} />
        <Box paddingBlock="1">
          <CheckmarkCircleIcon className={styles.checkmarkCircleIcon} />
          &nbsp;
          {
            item.svar ? parseHtml(t("diverse.ja")) : parseHtml(t("diverse.nei"))
          }
        </Box>
      </div>
    )
  })
}
