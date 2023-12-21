import type { TFunction } from "i18next";
import { KortStatus, Meldegruppe } from "~/models/meldekort";
import { KortType } from "~/models/kortType";
import { Ytelsestype } from "~/models/ytelsestype";

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

export const mapKortTypeTilTekst = (t: TFunction, type: KortType) => {
  switch (type) {
    case KortType.RETUR:
      return t("meldekort.type.retur");
    case KortType.ORDINAER:
      return t("meldekort.type.ordinar");
    case KortType.ERSTATNING:
      return t("meldekort.type.erstatning");
    case KortType.ELEKTRONISK:
      return t("meldekort.type.elektronisk");
    case KortType.AAP:
      return t("meldekort.type-AAP");
    case KortType.ORDINAER_MANUELL:
      return t("meldekort.type.ordinarManuell");
    case KortType.MASKINELT_OPPDATERT:
      return t("meldekort.type.maskineltOppdatert");
    case KortType.MANUELL_ARENA:
      return t("meldekort.type.manuellArena");
    case KortType.KORRIGERT_ELEKTRONISK:
      return t("meldekort.type.korrigertElektronisk");

    default:
      return "Feil i korttype";
  }
};

export const finnYtelsestypePostfix = (meldegruppe: Meldegruppe): string => {
  if (meldegruppe === Meldegruppe.ATTF) return Ytelsestype.AAP;
  if (meldegruppe === Meldegruppe.INDIV) return Ytelsestype.TILTAKSPENGER;
  return Ytelsestype.DAGPENGER;
};
