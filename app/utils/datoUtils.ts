import { DateTime } from "luxon";

export function formaterDato(dato: DateTime | string): string {
  if (typeof dato === "string") {
    return DateTime.fromISO(dato).toFormat("dd.MM.yyyy");
  } else if (dato != null && dato.isValid) {
    return dato.toFormat("dd.MM.yyyy");
  }

  return "?";
}

export function formaterTid(dato: DateTime | string): string {
  if (typeof dato === "string") {
    return DateTime.fromISO(dato).toFormat("HH:mm");
  } else if (dato != null && dato.isValid) {
    return dato.toFormat("HH:mm");
  }
  return "?";
}

export function formaterPeriodeDato(fraOgMed: DateTime | string, tilOgMed: DateTime | string) {
  const fom = formaterDato(fraOgMed);
  const tom = formaterDato(tilOgMed);

  return `${fom} - ${tom}`;
}

export function formaterPeriodeTilUkenummer(fraOgMed: DateTime | string, tilOgMed: DateTime | string) {
  let startUkenummer = 0;
  let sluttUkenummer = 0;

  if (typeof fraOgMed === "string") {
    startUkenummer = DateTime.fromISO(fraOgMed).weekNumber;
  } else if (fraOgMed != null && fraOgMed.isValid) {
    startUkenummer = fraOgMed.weekNumber;
  }

  if (typeof tilOgMed === "string") {
    sluttUkenummer = DateTime.fromISO(tilOgMed).weekNumber;
  } else if (tilOgMed != null && tilOgMed.isValid) {
    sluttUkenummer = tilOgMed.weekNumber;
  }

  return `${startUkenummer} - ${sluttUkenummer}`;
}

export function formaterPeriode(fraOgMed: string, plussDager: number, periodelengde: number): string {
  const nestePeriodeFom = DateTime.fromISO(fraOgMed).plus({ days: plussDager });
  const nestePeriodeTom = nestePeriodeFom.plus({ days: periodelengde - 1 });

  return formaterPeriodeTilUkenummer(nestePeriodeFom, nestePeriodeTom) + " (" + formaterPeriodeDato(nestePeriodeFom, nestePeriodeTom) + ")";
}

export function ukeFormatert(fraOgMed: string, plussDager = 14): string {
  const ukeFom = DateTime.fromISO(fraOgMed).plus({ days: plussDager });
  const ukeTom = ukeFom.plus({ days: 6 });

  return ukeFom.weekNumber + " (" + formaterPeriodeDato(ukeFom, ukeTom) + ")";
}
