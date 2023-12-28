import type { ISporsmal } from "~/models/sporsmal";

export function formaterBelop(belop?: number): string {
  if (typeof belop === "number") {
    if (belop === 0) {
      return "";
    }
    const desimaler = 2;
    const desimalSeparator = ",";
    const tusenSeparator = " ";
    const i = parseInt(
      Math.abs(Number(belop) || 0).toFixed(desimaler),
      10
    ).toString();
    const j = i.length > 3 ? i.length % 3 : 0;

    return (
      "kr. " +
      (j ? i.substring(0, j) + tusenSeparator : "") +
      i.substring(j).replace(/(\d{3})(?=\d)/g, "$1" + tusenSeparator) +
      (desimaler
        ? desimalSeparator +
        Math.abs(belop! - Number(i))
          .toFixed(desimaler)
          .slice(2)
        : "")
    );
  } else {
    return "";
  }
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
