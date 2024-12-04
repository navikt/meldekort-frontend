import type { ReactElement } from "react";

import Sideoverskrift from "~/components/sideoverskrift/Sideoverskrift";

import styles from "./Sideinnhold.module.css";


interface IProps {
  tittel?: string;
  innhold: ReactElement;
  utenSideoverskrift?: boolean;
}

export default function Sideinnhold(props: IProps) {
  const { tittel, innhold, utenSideoverskrift } = props;

  return (
    <div className={styles.sideInnhold}>
      {utenSideoverskrift || <Sideoverskrift tittel={tittel || ""} />}
      {innhold}
    </div>
  );
}
