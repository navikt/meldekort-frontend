import type { ISporsmal } from "~/models/sporsmal";
import { getText } from "~/utils/intlUtils";

export function formaterBelop(belop?: number): string {
  if (!belop || belop === 0 || isNaN(belop)) {
    return "kr. 0"
  }

  const desimaler = 2
  const desimalSeparator = ","
  const tusenSeparator = " "
  const i = parseInt(Math.abs(belop).toFixed(desimaler), 10).toString()
  const j = i.length > 3 ? i.length % 3 : 0

  return (
    "kr. " +
    (j ? i.substring(0, j) + tusenSeparator : "") +
    i.substring(j).replace(/(\d{3})(?=\d)/g, "$1" + tusenSeparator) +
    desimalSeparator +
    Math.abs(belop! - Number(i)).toFixed(desimaler).slice(2)
  )
}

export function byggBegrunnelseObjekt(str: string) {
  let obj = {}
  try {
    obj = JSON.parse(str)
  } catch (e) {

  }

  return obj
}

export function hentSvar(sporsmal: ISporsmal, spmid: string): boolean | null {
  for (const sporsmalKey in sporsmal) {
    if (sporsmalKey === spmid) {
      return (sporsmal as any)[sporsmalKey]
    }
  }

  return null
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
  ]
}
