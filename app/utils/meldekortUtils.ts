import type { IMeldekort } from "~/models/meldekort";
import { KortStatus } from "~/models/meldekort";
import { KortType } from "~/models/kortType";
import { Meldegruppe } from "~/models/meldegruppe";
import { Ytelsestype } from "~/models/ytelsestype";
import type { Jsonify } from "@remix-run/server-runtime/dist/jsonify";
import { getText } from "~/utils/intlUtils";

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

export const mapKortStatusTilTekst = (status: KortStatus) => {
  switch (status) {
    case KortStatus.KLAR:
      return getText("meldekort.status.klar");

    case KortStatus.REGIS:
      return getText("meldekort.status.regis");
    case KortStatus.NYKTR:
      return getText("meldekort.status.nyktr");
    case KortStatus.UBEHA:
      return getText("meldekort.status.ubeha");

    case KortStatus.FERDI:
      return getText("meldekort.status.ferdi");
    case KortStatus.IKKE:
      return getText("meldekort.status.ikke");
    case KortStatus.OVERM:
      return getText("meldekort.status.overm");

    case KortStatus.FMOPP:
      return getText("meldekort.status.fmopp");
    case KortStatus.FUOPP:
      return getText("meldekort.status.fuopp");
    case KortStatus.FEIL:
      return getText("meldekort.status.feil");
    case KortStatus.VENTE:
      return getText("meldekort.status.vente");


    default:
      return "Feil i status";
  }
};

export const mapKortTypeTilTekst = (type: KortType) => {
  switch (type) {
    case KortType.RETUR:
      return getText("meldekort.type.retur");
    case KortType.ORDINAER:
      return getText("meldekort.type.ordinar");
    case KortType.ERSTATNING:
      return getText("meldekort.type.erstatning");
    case KortType.ELEKTRONISK:
      return getText("meldekort.type.elektronisk");
    case KortType.AAP:
      return getText("meldekort.type-AAP");
    case KortType.ORDINAER_MANUELL:
      return getText("meldekort.type.ordinarManuell");
    case KortType.MASKINELT_OPPDATERT:
      return getText("meldekort.type.maskineltOppdatert");
    case KortType.MANUELL_ARENA:
      return getText("meldekort.type.manuellArena");
    case KortType.KORRIGERT_ELEKTRONISK:
      return getText("meldekort.type.korrigertElektronisk");

    default:
      return "Feil i korttype";
  }
};

export const finnYtelsestypePostfix = (meldegruppe: Meldegruppe): string => {
  if (meldegruppe === Meldegruppe.ATTF) return Ytelsestype.AAP;
  if (meldegruppe === Meldegruppe.INDIV) return Ytelsestype.TILTAKSPENGER;
  return Ytelsestype.DAGPENGER;
};

export const finnNesteSomKanSendes = (meldekort: IMeldekort[] | Jsonify<IMeldekort>[] | undefined, valgtMeldekortId: string) => {
  return meldekort?.sort(meldekortEtterKanSendesFraKomparator)
    .find(meldekort => meldekort.meldekortId.toString(10) !== valgtMeldekortId && meldekort.meldeperiode.kanKortSendes)
}

export const finnFoersteSomIkkeKanSendesEnna = (meldekort: IMeldekort[] | Jsonify<IMeldekort>[] | undefined) => {
  return meldekort?.sort(meldekortEtterKanSendesFraKomparator)
    .find(meldekort => meldekort.kortStatus === KortStatus.OPPRE && !meldekort.meldeperiode.kanKortSendes)
}

export const meldekortEtterKanSendesFraKomparator = (a: IMeldekort | Jsonify<IMeldekort>, b: IMeldekort | Jsonify<IMeldekort>): number => {
  return (
    new Date(a.meldeperiode.kortKanSendesFra).valueOf() -
    new Date(b.meldeperiode.kortKanSendesFra).valueOf()
  );
}
