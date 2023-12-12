import styles from "./Sideinnhold.module.css";
import Sideoverskrift from "~/components/sideoverskrift/Sideoverskrift";
import type { ReactElement } from "react";

interface IProps {
  tittel: string;
  innhold: ReactElement
}

export default function Sideinnhold(props: IProps) {
  const { innhold } = props;

  return (
    <div className={styles.sideInnhold}>
      <Sideoverskrift tittel={props.tittel} />
      {innhold}
    </div>
  );
}
