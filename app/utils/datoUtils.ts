import { format, getISOWeek } from "date-fns";

export const formaterDato = (dato: Date | string): string => {
  return format(new Date(dato), "dd.MM.yyyy");
};

export const formaterTid = (dato: Date | string): string => {
  return format(new Date(dato), "HH:mm");
};

export function formaterPeriodeDato(fraOgMed: Date | string, tilOgMed: Date | string) {
  const fom = formaterDato(fraOgMed);
  const tom = formaterDato(tilOgMed);

  return `${fom} - ${tom}`;
}

export function formaterPeriodeTilUkenummer(fraOgMed: Date | string, tilOgMed: Date | string) {
  const startUkenummer = getISOWeek(new Date(fraOgMed));
  const sluttUkenummer = getISOWeek(new Date(tilOgMed));

  return `${startUkenummer} - ${sluttUkenummer}`;
}

export function formaterPeriode(fom: string, plussDager: number, periodelengde: number): string {
  const nestePeriodeFom = new Date(fom)
  nestePeriodeFom.setDate(nestePeriodeFom.getDate() + plussDager)
  const nestePeriodeTom = new Date(nestePeriodeFom)
  nestePeriodeTom.setDate(nestePeriodeTom.getDate() + periodelengde - 1)

  return formaterPeriodeTilUkenummer(nestePeriodeFom, nestePeriodeTom) + " (" + formaterPeriodeDato(nestePeriodeFom, nestePeriodeTom) + ")"
}

export function ukeFormatert(fom: string, plussDager = 14): string {
  const ukeFom = new Date(fom)
  ukeFom.setDate(ukeFom.getDate() + plussDager)
  const ukeTom = new Date(ukeFom)
  ukeTom.setDate(ukeTom.getDate() + 6)

  return getISOWeek(ukeFom) + " (" + formaterPeriodeDato(ukeFom, ukeTom) + ")"
}
