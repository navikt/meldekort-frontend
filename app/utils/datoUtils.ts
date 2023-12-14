import { format, getISOWeek } from "date-fns";

export const formaterDato = (dato: Date | string): string => {
  return format(new Date(dato), "dd.MM.yyyy");
};

export function formaterPeriodeDato(fraOgMed: string, tilOgMed: string) {
  const fom = formaterDato(fraOgMed);
  const tom = formaterDato(tilOgMed);

  return `${fom} - ${tom}`;
}

export function formaterPeriodeTilUkenummer(fraOgMed: string, tilOgMed: string) {
  const startUkenummer = getISOWeek(new Date(fraOgMed));
  const sluttUkenummer = getISOWeek(new Date(tilOgMed));

  return `${startUkenummer} - ${sluttUkenummer}`;
}
