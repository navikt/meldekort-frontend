import type { TTFunction } from "~/utils/intlUtils";
import type { IMeldekort } from "~/models/meldekort";
import { KortStatus } from "~/models/meldekort";
import { KortType } from "~/models/kortType";
import { Meldegruppe } from "~/models/meldegruppe";
import { Ytelsestype } from "~/models/ytelsestype";
import type { Jsonify } from "@remix-run/server-runtime/dist/jsonify";

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

export const mapKortStatusTilTekst = (tt: TTFunction, status: KortStatus) => {
  switch (status) {
    case KortStatus.KLAR:
      return tt("meldekort.status.klar");

    case KortStatus.REGIS:
      return tt("meldekort.status.regis");
    case KortStatus.NYKTR:
      return tt("meldekort.status.nyktr");
    case KortStatus.UBEHA:
      return tt("meldekort.status.ubeha");

    case KortStatus.FERDI:
      return tt("meldekort.status.ferdi");
    case KortStatus.IKKE:
      return tt("meldekort.status.ikke");
    case KortStatus.OVERM:
      return tt("meldekort.status.overm");

    case KortStatus.FMOPP:
      return tt("meldekort.status.fmopp");
    case KortStatus.FUOPP:
      return tt("meldekort.status.fuopp");
    case KortStatus.FEIL:
      return tt("meldekort.status.feil");
    case KortStatus.VENTE:
      return tt("meldekort.status.vente");


    default:
      return "Feil i status";
  }
};

export const mapKortTypeTilTekst = (tt: TTFunction, type: KortType) => {
  switch (type) {
    case KortType.RETUR:
      return tt("meldekort.type.retur");
    case KortType.ORDINAER:
      return tt("meldekort.type.ordinar");
    case KortType.ERSTATNING:
      return tt("meldekort.type.erstatning");
    case KortType.ELEKTRONISK:
      return tt("meldekort.type.elektronisk");
    case KortType.AAP:
      return tt("meldekort.type-AAP");
    case KortType.ORDINAER_MANUELL:
      return tt("meldekort.type.ordinarManuell");
    case KortType.MASKINELT_OPPDATERT:
      return tt("meldekort.type.maskineltOppdatert");
    case KortType.MANUELL_ARENA:
      return tt("meldekort.type.manuellArena");
    case KortType.KORRIGERT_ELEKTRONISK:
      return tt("meldekort.type.korrigertElektronisk");

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
