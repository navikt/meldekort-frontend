import { useTranslation } from "react-i18next";
import type { ReactElement } from "react";
import { useState } from "react";
import { Link } from "@navikt/ds-react";
import { ChevronDownIcon, ChevronUpIcon } from "@navikt/aksel-icons";
import styles from "./UtvidetInformasjon.module.css";

interface IProps {
  innhold: ReactElement;
}

export default function UtvidetInformasjon(props: IProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const clickHandler = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setOpen(!open);
  }

  if (open) {
    return <div>
      <div className={styles.innhold}>
        {props.innhold}
      </div>
      <Link href="#" className={styles.link} onClick={clickHandler}>
        {t("veiledning.lukk")}
        <ChevronUpIcon />
      </Link>
    </div>
  } else {
    return (
      <div>
        <Link href="#" className={styles.link} onClick={clickHandler}>
          {t("veiledning.les")}
          <ChevronDownIcon />
        </Link>
      </div>
    )
  }
}
