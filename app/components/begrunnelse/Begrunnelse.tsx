import { Label } from "@navikt/ds-react";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";
import UtvidetInformasjon from "~/components/utvidetInformasjon/UtvidetInformasjon";
import { CheckmarkCircleIcon } from "@navikt/aksel-icons";
import styles from "./Begrunnelse.module.css";


interface IProps {
  begrunnelse: string;
  ytelsestypePostfix: string;
}

export default function Begrunnelse(props: IProps) {
  const { begrunnelse, ytelsestypePostfix } = props
  const { tt } = useExtendedTranslation()

  return (
    <div key="begrunnelse" className={styles.begrunnelse}>
      <Label>{parseHtml(tt("korrigering.sporsmal.begrunnelse"))}</Label>
      <UtvidetInformasjon innhold={parseHtml(tt("forklaring.sporsmal.begrunnelse" + ytelsestypePostfix))} />
      <CheckmarkCircleIcon className={styles.checkmarkCircleIcon} /> {begrunnelse}
    </div>
  )
}
