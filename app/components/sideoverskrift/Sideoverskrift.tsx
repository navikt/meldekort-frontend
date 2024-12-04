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
        <h2 className="navds-heading navds-heading--large" data-testid="sideTittel">{props.tittel}</h2>
      </div>
      <Sprakvelger />
    </div>
  );
}
