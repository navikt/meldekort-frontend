import type { Jsonify } from "@remix-run/server-runtime/dist/jsonify";

import type { Meldegruppe } from "~/models/meldegruppe";
import type { IMeldekortDag, ISporsmal } from "~/models/sporsmal";
import { getText } from "~/utils/intlUtils";


export function formaterBelop(belop?: number): string {
  if (!belop || belop === 0 || isNaN(belop)) {
    return "kr. 0";
  }

  const desimaler = 2;
  const desimalSeparator = ",";
  const tusenSeparator = " ";
  const i = parseInt(Math.abs(belop).toFixed(desimaler), 10).toString();
  const j = i.length > 3 ? i.length % 3 : 0;

  return (
    "kr. " +
    (j ? i.substring(0, j) + tusenSeparator : "") +
    i.substring(j).replace(/(\d{3})(?=\d)/g, "$1" + tusenSeparator) +
    desimalSeparator +
    Math.abs(belop! - Number(i)).toFixed(desimaler).slice(2)
  );
}

export function byggBegrunnelseObjekt(str: string) {
  let obj = {};
  try {
    obj = JSON.parse(str);
  } catch (e) {
    console.error(e)
  }

  return obj;
}

export function hentSvar(sporsmal: ISporsmal, spmid: string): boolean | null {
  for (const sporsmalKey in sporsmal) {
    if (sporsmalKey === spmid) {
      return sporsmal[sporsmalKey];
    }
  }

  return null;
}

export function ukeDager() {
  return [
    getText("ukedag.mandag").trim(),
    getText("ukedag.tirsdag").trim(),
    getText("ukedag.onsdag").trim(),
    getText("ukedag.torsdag").trim(),
    getText("ukedag.fredag").trim(),
    getText("ukedag.lordag").trim(),
    getText("ukedag.sondag").trim(),
  ];
}

export function opprettSporsmal(meldegruppe: Meldegruppe, arbeidssoker: boolean | null) {
  const dager = new Array<IMeldekortDag>();
  for (let i = 1; i <= 14; i++) dager.push({
    "dag": i,
    "arbeidetTimerSum": 0,
    "syk": false,
    "annetFravaer": false,
    "kurs": false,
    "meldegruppe": meldegruppe,
  });

  const sporsmal: Jsonify<ISporsmal> = {
    arbeidet: null,
    kurs: null,
    syk: null,
    annetFravaer: null,
    arbeidssoker: arbeidssoker, // Dette spørsmålet må besvares Ja når brukeren etterregistrerer meldekort
    signatur: true, // Vi sender ikke uten brukerens samtykke uansett
    meldekortDager: dager,
  };

  return sporsmal;
}
