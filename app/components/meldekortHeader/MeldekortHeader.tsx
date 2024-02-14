import { NavLink } from "@remix-run/react";
import { useExtendedTranslation } from "~/utils/intlUtils";
import classNames from "classnames";
import { MenuHamburgerIcon } from "@navikt/aksel-icons";
import styles from "./MeldekortHeader.module.css";


type LinkState = {
  isActive: boolean,
  isPending: boolean
}

function togleMobileMenu() {
  const element = document.getElementById("menu")

  if (element?.classList.contains(styles.open)) element?.classList.remove(styles.open)
  else element?.classList.add(styles.open)
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
        <div className={styles.mobileMenu} data-testid="mobileMenu" onClick={() => togleMobileMenu()}>
          <MenuHamburgerIcon title="a11y-title" fontSize="3rem" />
        </div>
      </div>
      <div className={styles.menu} id="menu" data-testid="menu">
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
