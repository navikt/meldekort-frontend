import { useExtendedTranslation } from "~/utils/intlUtils";
import { Heading, Tag } from "@navikt/ds-react";
import { NavLink } from "@remix-run/react";
import { formaterDato, formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/datoUtils";
import { finnRiktigTagVariant, mapKortStatusTilTekst } from "~/utils/meldekortUtils";
import type { Jsonify } from "@remix-run/server-runtime/dist/jsonify";
import type { IMeldekort } from "~/models/meldekort";
import { KortStatus } from "~/models/meldekort";
import { formaterBelop } from "~/utils/miscUtils";
import classNames from "classnames";
import styles from "./MeldekortTabell.module.css";
import { getEnv } from "~/utils/envUtils";


interface IProps {
  meldekortListe: Jsonify<IMeldekort>[];
}

export default function MeldekorTabell(props: IProps) {
  const { meldekortListe } = props;

  const { tt } = useExtendedTranslation();

  return (
    <div>
      <div className={classNames(styles.row, styles.header)}>
        <div><Heading size="xsmall" level="4">{tt("overskrift.periode")}</Heading></div>
        <div><Heading size="xsmall" level="4">{tt("overskrift.dato")}</Heading></div>
        <div><Heading size="xsmall" level="4">{tt("overskrift.mottatt")}</Heading></div>
        <div><Heading size="xsmall" level="4">{tt("overskrift.status")}</Heading></div>
        <div><Heading size="xsmall" level="4">{tt("overskrift.bruttoBelop")}</Heading></div>
      </div>
      {meldekortListe.map((meldekort) => {
        return (
          <div className={styles.row} key={meldekort.meldekortId} data-testid={meldekort.meldekortId}>
            <div className={styles.header}><Heading size="xsmall" level="4">{tt("overskrift.periode")}</Heading></div>
            <div className={styles.header}><Heading size="xsmall" level="4">{tt("overskrift.dato")}</Heading></div>
            <div className={styles.header}><Heading size="xsmall" level="4">{tt("overskrift.mottatt")}</Heading></div>
            <div className={styles.header}><Heading size="xsmall" level="4">{tt("overskrift.status")}</Heading></div>
            <div className={styles.header}><Heading size="xsmall" level="4">{tt("overskrift.bruttoBelop")}</Heading>
            </div>
            <div>
              <NavLink to={`/tidligere-meldekort/${meldekort.meldekortId}`}>
                {tt("overskrift.uke")} {formaterPeriodeTilUkenummer(meldekort.meldeperiode.fra, meldekort.meldeperiode.til)}
              </NavLink>
            </div>
            <div>
              {formaterPeriodeDato(meldekort.meldeperiode.fra, meldekort.meldeperiode.til)}
            </div>
            <div>
              {formaterDato(meldekort.mottattDato)}
            </div>
            <div>
              <Tag variant={finnRiktigTagVariant(meldekort.kortStatus, meldekort.kortType)} className={styles.tag}>
                {mapKortStatusTilTekst(meldekort.kortStatus, meldekort.kortType)}
              </Tag>
            </div>
            <div>
              {(meldekort.kortStatus === KortStatus.FERDI) ? formaterBelop(meldekort.bruttoBelop) : ""}
            </div>
          </div>
        );
      })}
    </div>
  );
}