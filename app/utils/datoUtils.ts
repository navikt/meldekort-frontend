import { format, getISOWeek, parse } from "date-fns";

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

export function formaterPeriodekodeTilDatoer(periodekode: string) {
  return `${formaterPeriodekodeTilFom(periodekode)} - ${formaterPeriodekodeTilTom(periodekode)}`;
}

export function formaterPeriodekodeTilFom(periodekode: string) {
  let aar = periodekode.substring(0, 4)
  let uke = Number(periodekode.substring(4))

  let fom = new Date(aar);
  let numOfdaysPastSinceLastMonday = fom.getDay() - 1;
  fom.setDate(fom.getDate() - numOfdaysPastSinceLastMonday);
  fom.setDate(fom.getDate() + (7 * (uke - getWeek(fom))));

  return formaterDato(fom)
}

export function formaterPeriodekodeTilTom(periodekode: string) {
  let aar = periodekode.substring(0, 4)
  let uke = Number(periodekode.substring(4))

  let tom = new Date(aar);
  let numOfdaysPastSinceLastMonday = tom.getDay() - 1;
  tom.setDate(tom.getDate() - numOfdaysPastSinceLastMonday);
  tom.setDate(tom.getDate() + (7 * (uke - getWeek(tom))));
  tom.setDate(tom.getDate() + 14);

  return formaterDato(tom)
}

function getWeek(input: Date) {
  let date = new Date(input.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  let week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}
