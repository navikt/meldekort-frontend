import { NavLink } from "@remix-run/react";
import { useExtendedTranslation } from "~/utils/intlUtils";
import classNames from "classnames";
import styles from "./MeldekortHeader.module.css";

type LinkState = {
  isActive: boolean,
  isPending: boolean
}

function setClassName(linkState: LinkState) {
  return linkState.isPending || linkState.isActive ? classNames(styles.menuItem, styles.menuItemActive) : styles.menuItem
}

export default function MeldekortHeader() {
  const { tt } = useExtendedTranslation();

  return (
    <div>
      <div className={styles.heading}>
        <div className={styles.title}>
          <h1 className="navds-heading navds-heading--xlarge">{tt("overskrift.meldekort")}</h1>
        </div>
      </div>
      <div className={styles.menu}>
        <NavLink to="/send-meldekort" className={setClassName}>
          {tt("sekundarmeny.send")}
        </NavLink>
        <NavLink to="/tidligere-meldekort" className={setClassName}>
          {tt("sekundarmeny.tidligere")}
        </NavLink>
        <NavLink to="/etterregistrering" className={setClassName}>
          {tt("sekundarmeny.etterregistrer")}
        </NavLink>
        <NavLink to="/om-meldekort" className={setClassName}>
          {tt("sekundarmeny.omMeldekort")}
        </NavLink>
        <NavLink to="/ofte-stilte-sporsmal" className={setClassName}>
          {tt("sekundarmeny.faq")}
        </NavLink>
      </div>
    </div>
  )
}
