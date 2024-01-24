import styles from "./Sprakvelger.module.css";
import { Select } from "@navikt/ds-react";
import type { ChangeEvent } from "react";
import { useExtendedTranslation } from "~/utils/intlUtils";
import { useState } from "react";
import classNames from "classnames";

export default function Sprakvelger() {
  const { i18n, tt } = useExtendedTranslation();
  const [currentLocale, setCurrentLocale] = useState(i18n.language);

  const setLocale = (event: ChangeEvent<HTMLSelectElement>) => {
    setCurrentLocale(event.target.value)
    i18n.changeLanguage(event.target.value).catch((error) => console.log(error))
  }

  return (
    <div className={classNames(styles.sprakvelger, styles[currentLocale])}>
      <Select label={tt("sprakvelger.chooseLanguage")} hideLabel value={currentLocale} onChange={setLocale}>
        <option value="nb">
          Norsk
        </option>
        <option value="en">
          English
        </option>
      </Select>
    </div>
  );
}
