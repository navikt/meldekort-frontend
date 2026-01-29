import { Heading } from "@navikt/ds-react";
import classnames from "classnames";

import Sprakvelger from "~/components/sprakvelger/Sprakvelger";

import styles from "./Sideoverskrift.module.css";


interface IProps {
  tittel: string;
}

export default function Sideoverskrift(props: IProps) {
  return (
    <div className={classnames(styles.sideHeader, "notForPrint")}>
      <div>
        <Heading size="large" level="2" data-testid="sideTittel">
          {props.tittel}
        </Heading>
      </div>
      <Sprakvelger />
    </div>
  );
}
