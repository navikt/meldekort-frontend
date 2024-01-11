import { Label } from "@navikt/ds-react";
import { parseHtml } from "~/utils/intlUtils";
import UtvidetInformasjon from "~/components/utvidetInformasjon/UtvidetInformasjon";
import { CheckmarkCircleIcon } from "@navikt/aksel-icons";
import { useTranslation } from "react-i18next";
import styles from "./Begrunnelse.module.css";

interface IProps {
  begrunnelse: string;
}

export default function Begrunnelse(props: IProps) {
  const { t } = useTranslation();

  return (
    <div key="begrunnelse" className={styles.begrunnelse}>
      <Label>{parseHtml(t("korrigering.sporsmal.begrunnelse"))}</Label>
      <UtvidetInformasjon innhold={parseHtml(t("forklaring.sporsmal.begrunnelse"))} />
      <CheckmarkCircleIcon className={styles.checkmarkCircleIcon} /> {props.begrunnelse}
    </div>
  )
}
