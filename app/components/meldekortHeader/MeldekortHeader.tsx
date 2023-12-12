import styles from "./MeldekortHeader.module.css";
import { NavLink } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

type LinkState = {
  isActive: boolean,
  isPending: boolean
}

function setClassName(linkState: LinkState) {
  return linkState.isPending || linkState.isActive ? classNames(styles.menuItem, styles.menuItemActive) : styles.menuItem
}

export default function MeldekortHeader() {
  const { t } = useTranslation();

  return (
    <div>
      <div className={styles.heading}>
        <div className={styles.title}>
          <h1 className="navds-heading navds-heading--xlarge">{t("overskrift.meldekort")}</h1>
        </div>
      </div>
      <div className={styles.menu}>
        <NavLink to="/send-meldekort" className={setClassName}>
          {t("sekundarmeny.send")}
        </NavLink>
        <NavLink to="/tidligere-meldekort" className={setClassName}>
          {t("sekundarmeny.tidligere")}
        </NavLink>
        <NavLink to="/etterregistrering" className={setClassName}>
          {t("sekundarmeny.etterregistrer")}
        </NavLink>
        <NavLink to="/om-meldekort" className={setClassName}>
          {t("sekundarmeny.omMeldekort")}
        </NavLink>
        <NavLink to="/ofte-stilte-sporsmal" className={setClassName}>
          {t("sekundarmeny.faq")}
        </NavLink>
      </div>
    </div>
  )
}
