import { CheckmarkCircleIcon } from "@navikt/aksel-icons";
import { Box, Label } from "@navikt/ds-react";

import UtvidetInformasjon from "~/components/utvidetInformasjon/UtvidetInformasjon";
import type { ISporsmal, ISporsmalOgSvar } from "~/models/sporsmal";
import { sporsmalConfig } from "~/models/sporsmal";
import { formaterPeriode } from "~/utils/datoUtils";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";
import { hentSvar } from "~/utils/miscUtils";

import styles from "./SporsmalOgSvar.module.css";


interface IProps {
  sporsmal: ISporsmal;
  fom: string;
  ytelsestypePostfix: string;
}

export default function SporsmalOgSvar(props: IProps) {
  const { tt } = useExtendedTranslation();
  const { sporsmal, fom, ytelsestypePostfix } = props;

  const nestePeriodeFormatertDato = formaterPeriode(fom, 14, 14);

  const sporsmalOgSvar: ISporsmalOgSvar[] = sporsmalConfig.map(sporsmalsObj => {
    return {
      id: sporsmalsObj.id,
      kategori: sporsmalsObj.kategori,
      sporsmal: sporsmalsObj.sporsmal + ytelsestypePostfix,
      forklaring: sporsmalsObj.forklaring + ytelsestypePostfix,
      svar: hentSvar(sporsmal, sporsmalsObj.id),
      formatertDato: sporsmalsObj.kategori === "registrert" ? nestePeriodeFormatertDato : undefined,
    };
  });

  return sporsmalOgSvar.map((item) => {
    return (
      <div key={item.sporsmal} className={styles.sporsmalOgSvar}>
        <Label data-testid={item.sporsmal}>
          {parseHtml(tt(item.sporsmal))}
          {item.formatertDato ? <span> {item.formatertDato}?</span> : null}
        </Label>
        <UtvidetInformasjon
          innhold={parseHtml(tt(item.forklaring))}
          logText={`Viser "Les mer" for ${item.id} på Bekreftelse/Kvittering`}
        />
        <Box paddingBlock="1" data-testid={item.sporsmal + ".svar"}>
          <CheckmarkCircleIcon className={styles.checkmarkCircleIcon} />
          &nbsp;
          {
            item.svar ? parseHtml(tt("diverse.ja")) : parseHtml(tt("diverse.nei"))
          }
        </Box>
      </div>
    );
  });
}
