import styles from "./meldekortHeader.module.css";
import { NavLink } from "@remix-run/react";

type LinkState = {
  isActive: boolean,
  isPending: boolean
}
function setClassName(linkState: LinkState) {
  return linkState.isPending || linkState.isActive ? styles.menuItem + " " + styles.menuItemActive : styles.menuItem
}

export default function MeldekortHeader() {

  return (
    <div>
      <div className={styles.heading}>
        <div className={styles.title}>
          <h1 className="navds-heading navds-heading--xlarge">Meldekort</h1>
        </div>
      </div>
      <div className={styles.menu}>
        <NavLink to="/send-meldekort" className={setClassName}>
          Send meldekort
        </NavLink>
        <NavLink to="/tidligere-meldekort" className={setClassName}>
          Tidligere meldekort
        </NavLink>
        <NavLink to="/etterregistrering" className={setClassName}>
          Etterregistrere meldekort
        </NavLink>
        <NavLink to="/om-meldekort" className={setClassName}>
          Om meldekort
        </NavLink>
        <NavLink to="/ofte-stilte-sporsmal" className={setClassName}>
          Ofte stilte spørsmål
        </NavLink>
      </div>
    </div>
  )
}
