import { ChevronDownIcon, ChevronUpIcon } from "@navikt/aksel-icons";
import { Link } from "@navikt/ds-react";
import type { ReactElement } from "react";
import React, { useState } from "react";

import { loggAktivitet } from "~/utils/amplitudeUtils";
import { useExtendedTranslation } from "~/utils/intlUtils";

import styles from "./UtvidetInformasjon.module.css";


interface IProps {
  innhold: ReactElement;
  logText: string;
}

export default function UtvidetInformasjon(props: IProps) {
  const { tt } = useExtendedTranslation();
  const [open, setOpen] = useState(false);

  const clickHandler = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    event.preventDefault();
    if (!open) loggAktivitet(props.logText);
    setOpen(!open);
  };

  if (open) {
    return (
      <div className="notForPrint">
        <div className={styles.innhold}>
          {props.innhold}
        </div>
        <Link href="#" onClick={clickHandler}>
          {tt("veiledning.lukk")}
          <ChevronUpIcon />
        </Link>
      </div>
    );
  } else {
    return (
      <div className="notForPrint">
        <Link href="#" onClick={clickHandler}>
          {tt("veiledning.les")}
          <ChevronDownIcon />
        </Link>
      </div>
    );
  }
}
