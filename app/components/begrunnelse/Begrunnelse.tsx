import { CheckmarkCircleIcon } from "@navikt/aksel-icons";
import { Box, Label } from "@navikt/ds-react";

import UtvidetInformasjon from "~/components/utvidetInformasjon/UtvidetInformasjon";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";

import styles from "./Begrunnelse.module.css";


interface IProps {
  begrunnelse: string;
  ytelsestypePostfix: string;
}

export default function Begrunnelse(props: IProps) {
  const { begrunnelse, ytelsestypePostfix } = props;
  const { tt } = useExtendedTranslation();

  return (
    <div key="begrunnelse" className={styles.begrunnelse}>
      <Label>{parseHtml(tt("korrigering.sporsmal.begrunnelse"))}</Label>
      <UtvidetInformasjon
        innhold={parseHtml(tt("forklaring.sporsmal.begrunnelse" + ytelsestypePostfix))}
        logText={"Viser \"Les mer\" for begrunnelse for korrigering på Bekreftelse/Kvittering"}
      />
      <Box paddingBlock="1">
        <CheckmarkCircleIcon className={styles.checkmarkCircleIcon} />&nbsp;{begrunnelse}
      </Box>
    </div>
  );
}
