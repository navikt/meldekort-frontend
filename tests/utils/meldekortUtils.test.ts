import { describe, expect, test } from "vitest";
import {
  finnFoersteSomIkkeKanSendesEnna,
  finnNesteSomKanSendes,
  finnRiktigTagVariant,
  finnYtelsestypePostfix,
  mapKortStatusTilTekst,
  mapKortTypeTilTekst,
} from "~/utils/meldekortUtils";
import type { IMeldekort } from "~/models/meldekort";
import { KortStatus } from "~/models/meldekort";
import { KortType } from "~/models/kortType";
import { Meldegruppe } from "~/models/meldegruppe";
import { Ytelsestype } from "~/models/ytelsestype";
import { jsonify, opprettTestMeldekort } from "../mocks/data";


describe("Meldekort utils", () => {
  test("finnRiktigTagVariant skal returnere riktig varinat", () => {
    let result = finnRiktigTagVariant(KortStatus.KAND, KortType.KORRIGERT_ELEKTRONISK);
    expect(result).toBe("alt3");
    result = finnRiktigTagVariant(KortStatus.IKKE, KortType.KORRIGERT_ELEKTRONISK);
    expect(result).toBe("alt3");

    result = finnRiktigTagVariant(KortStatus.FERDI, KortType.KORRIGERT_ELEKTRONISK);
    expect(result).toBe("success");

    result = finnRiktigTagVariant(KortStatus.KLAR, KortType.ELEKTRONISK);
    expect(result).toBe("warning");

    result = finnRiktigTagVariant(KortStatus.REGIS, KortType.ELEKTRONISK);
    expect(result).toBe("info");
    result = finnRiktigTagVariant(KortStatus.NYKTR, KortType.ELEKTRONISK);
    expect(result).toBe("info");
    result = finnRiktigTagVariant(KortStatus.UBEHA, KortType.ELEKTRONISK);
    expect(result).toBe("info");

    result = finnRiktigTagVariant(KortStatus.FERDI, KortType.ELEKTRONISK);
    expect(result).toBe("success");
    result = finnRiktigTagVariant(KortStatus.KAND, KortType.ELEKTRONISK);
    expect(result).toBe("success");
    result = finnRiktigTagVariant(KortStatus.IKKE, KortType.ELEKTRONISK);
    expect(result).toBe("success");
    result = finnRiktigTagVariant(KortStatus.OVERM, KortType.ELEKTRONISK);
    expect(result).toBe("success");

    result = finnRiktigTagVariant("" as KortStatus, KortType.ELEKTRONISK);
    expect(result).toBe("error");
  });

  test("mapKortStatusTilTekst skal returnere riktig varinat", () => {
    let result = mapKortStatusTilTekst(KortStatus.KAND, KortType.KORRIGERT_ELEKTRONISK);
    expect(result).toBe("meldekort.type.korrigert");
    result = mapKortStatusTilTekst(KortStatus.IKKE, KortType.KORRIGERT_ELEKTRONISK);
    expect(result).toBe("meldekort.type.korrigert");

    result = mapKortStatusTilTekst(KortStatus.KLAR, KortType.ELEKTRONISK);
    expect(result).toBe("meldekort.status.klar");

    result = mapKortStatusTilTekst(KortStatus.REGIS, KortType.ELEKTRONISK);
    expect(result).toBe("meldekort.status.regis");

    result = mapKortStatusTilTekst(KortStatus.NYKTR, KortType.ELEKTRONISK);
    expect(result).toBe("meldekort.status.nyktr");

    result = mapKortStatusTilTekst(KortStatus.UBEHA, KortType.ELEKTRONISK);
    expect(result).toBe("meldekort.status.ubeha");

    result = mapKortStatusTilTekst(KortStatus.FERDI, KortType.ELEKTRONISK);
    expect(result).toBe("meldekort.status.ferdi");

    result = mapKortStatusTilTekst(KortStatus.KAND, KortType.ELEKTRONISK);
    expect(result).toBe("meldekort.status.kand");
    result = mapKortStatusTilTekst(KortStatus.IKKE, KortType.ELEKTRONISK);
    expect(result).toBe("meldekort.status.ikke");

    result = mapKortStatusTilTekst(KortStatus.OVERM, KortType.ELEKTRONISK);
    expect(result).toBe("meldekort.status.overm");

    result = mapKortStatusTilTekst(KortStatus.FMOPP, KortType.ELEKTRONISK);
    expect(result).toBe("meldekort.status.fmopp");

    result = mapKortStatusTilTekst(KortStatus.FUOPP, KortType.ELEKTRONISK);
    expect(result).toBe("meldekort.status.fuopp");

    result = mapKortStatusTilTekst(KortStatus.FEIL, KortType.ELEKTRONISK);
    expect(result).toBe("meldekort.status.feil");

    result = mapKortStatusTilTekst(KortStatus.VENTE, KortType.ELEKTRONISK);
    expect(result).toBe("meldekort.status.vente");

    result = mapKortStatusTilTekst("" as KortStatus, KortType.ELEKTRONISK);
    expect(result).toBe("Feil i status");
  });

  test("mapKortTypeTilTekst skal returnere riktig varinat", () => {
    let result = mapKortTypeTilTekst(KortType.RETUR);
    expect(result).toBe("meldekort.type.retur");

    result = mapKortTypeTilTekst(KortType.RETUR);
    expect(result).toBe("meldekort.type.retur");

    result = mapKortTypeTilTekst(KortType.ORDINAER);
    expect(result).toBe("meldekort.type.ordinar");

    result = mapKortTypeTilTekst(KortType.ERSTATNING);
    expect(result).toBe("meldekort.type.erstatning");

    result = mapKortTypeTilTekst(KortType.ELEKTRONISK);
    expect(result).toBe("meldekort.type.elektronisk");

    result = mapKortTypeTilTekst(KortType.AAP);
    expect(result).toBe("meldekort.type-AAP");

    result = mapKortTypeTilTekst(KortType.ORDINAER_MANUELL);
    expect(result).toBe("meldekort.type.ordinarManuell");

    result = mapKortTypeTilTekst(KortType.MASKINELT_OPPDATERT);
    expect(result).toBe("meldekort.type.maskineltOppdatert");

    result = mapKortTypeTilTekst(KortType.MANUELL_ARENA);
    expect(result).toBe("meldekort.type.manuellArena");

    result = mapKortTypeTilTekst(KortType.KORRIGERT_ELEKTRONISK);
    expect(result).toBe("meldekort.type.korrigertElektronisk");

    result = mapKortTypeTilTekst("" as KortType);
    expect(result).toBe("Feil i korttype");
  });

  test("finnYtelsestypePostfix skal returnere riktig varinat", () => {
    let result = finnYtelsestypePostfix(Meldegruppe.ATTF);
    expect(result).toBe(Ytelsestype.AAP);

    result = finnYtelsestypePostfix(Meldegruppe.INDIV);
    expect(result).toBe(Ytelsestype.TILTAKSPENGER);

    result = finnYtelsestypePostfix(Meldegruppe.DAGP);
    expect(result).toBe(Ytelsestype.DAGPENGER);

    result = finnYtelsestypePostfix(Meldegruppe.FY);
    expect(result).toBe(Ytelsestype.DAGPENGER);

    result = finnYtelsestypePostfix(Meldegruppe.ARBS);
    expect(result).toBe(Ytelsestype.DAGPENGER);

    result = finnYtelsestypePostfix(Meldegruppe.NULL);
    expect(result).toBe(Ytelsestype.DAGPENGER);
  });

  test("finnNesteSomKanSendes skal returnere riktig meldekort", () => {
    const meldekort1: IMeldekort = opprettTestMeldekort(1707156950, true, KortStatus.SENDT);
    const meldekort2: IMeldekort = opprettTestMeldekort(1707156951, false);
    const meldekort3: IMeldekort = opprettTestMeldekort(1707156952);
    const meldekort4: IMeldekort = opprettTestMeldekort(1707156953);

    const meldekort: IMeldekort[] = [meldekort1, meldekort2, meldekort3, meldekort4];

    // Sjekk med IMeldekort[]
    let result = finnNesteSomKanSendes(meldekort, meldekort1.meldekortId.toString());
    expect(result).toBe(meldekort3);

    result = finnNesteSomKanSendes(meldekort, meldekort2.meldekortId.toString());
    expect(result).toBe(meldekort1);

    // Sjekk med Jsonify<IMeldekort>[]
    jsonify(meldekort);
    result = finnNesteSomKanSendes(meldekort, meldekort1.meldekortId.toString());
    expect(result).toBe(meldekort3);

    result = finnNesteSomKanSendes(meldekort, meldekort2.meldekortId.toString());
    expect(result).toBe(meldekort1);

    // Sjekk at metoden fungerer med undefined
    result = finnNesteSomKanSendes(undefined, meldekort2.meldekortId.toString());
    expect(result).toBe(undefined);
  });

  test("finnFoersteSomIkkeKanSendesEnna skal returnere riktig meldekort", () => {
    const meldekort1: IMeldekort = opprettTestMeldekort(1707156950);
    const meldekort2: IMeldekort = opprettTestMeldekort(1707156951, false, KortStatus.SENDT);
    const meldekort3: IMeldekort = opprettTestMeldekort(1707156952, false);
    const meldekort4: IMeldekort = opprettTestMeldekort(1707156953);

    // Unsorted Array. Da kan vi teste også meldekortEtterKanSendesFraKomparator
    const meldekort: IMeldekort[] = [meldekort1, meldekort3, meldekort4, meldekort2];

    // Sjekk med IMeldekort[]
    let result = finnFoersteSomIkkeKanSendesEnna(meldekort);
    expect(result).toBe(meldekort2);

    // Sjekk med Jsonify<IMeldekort>[]
    jsonify(meldekort);
    result = finnFoersteSomIkkeKanSendesEnna(meldekort);
    expect(result).toBe(meldekort2);
  });
});
