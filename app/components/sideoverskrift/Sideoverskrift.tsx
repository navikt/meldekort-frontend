import styles from "./Sideoverskrift.module.css";
import Sprakvelger from "~/components/sprakvelger/Sprakvelger";

interface IProps {
  tittel: string;
}

export default function Sideoverskrift(props: IProps) {
  return (
    <div className={styles.sideHeader}>
      <div>
        <h2 className="navds-heading navds-heading--large" data-testid="sideTittel">{props.tittel}</h2>
      </div>
      <Sprakvelger />
    </div>
  );
}
