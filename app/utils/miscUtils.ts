import { KortStatus } from "~/models/meldekort";
import type { TFunction } from "i18next";

export const finnRiktigTagVariant = (status: KortStatus): "success" | "info" | "warning" | "error" => {
  switch (status) {
    case KortStatus.KLAR:
      return "warning";
    case KortStatus.REGIS:
    case KortStatus.NYKTR:
    case KortStatus.UBEHA:
      return "info";
    case KortStatus.FERDI:
    case KortStatus.IKKE:
    case KortStatus.OVERM:
      return "success";
    default:
      return "error";
  }
};

export const mapKortStatusTilTekst = (t: TFunction, status: KortStatus) => {
  switch (status) {
    case KortStatus.KLAR:
      return t("meldekort.status.klar");

    case KortStatus.REGIS:
      return t("meldekort.status.regis");
    case KortStatus.NYKTR:
      return t("meldekort.status.nyktr");
    case KortStatus.UBEHA:
      return t("meldekort.status.ubeha");

    case KortStatus.FERDI:
      return t("meldekort.status.ferdi");
    case KortStatus.IKKE:
      return t("meldekort.status.ikke");
    case KortStatus.OVERM:
      return t("meldekort.status.overm");

    case KortStatus.FMOPP:
      return t("meldekort.status.fmopp");
    case KortStatus.FUOPP:
      return t("meldekort.status.fuopp");
    case KortStatus.FEIL:
      return t("meldekort.status.feil");
    case KortStatus.VENTE:
      return t("meldekort.status.vente");


    default:
      return "Feil i status";
  }
};

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
