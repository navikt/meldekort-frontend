import type { IMeldekort } from "~/models/meldekort";
import { KortStatus } from "~/models/meldekort";
import { KortType } from "~/models/kortType";
import { Meldegruppe } from "~/models/meldegruppe";
import type { IMeldekortdetaljer } from "~/models/meldekortdetaljer";

// Gjør det samme som json() i loader (nå konvertere bare Date til String)
export const jsonify = (data: Object) => {
  for (const key in data) {
    if ((data as any)[key] instanceof Date) {
      (data as any)[key] = (data as any)[key].toISOString()
    } else if (typeof (data as any)[key] === "object") {
      jsonify((data as any)[key])
    }
  }
}

// For å opprette testdata
export const opprettTestMeldekort = (meldekortId: number): IMeldekort => {
  return {
    meldekortId: meldekortId,
    kortType: KortType.ELEKTRONISK,
    meldeperiode: {
      fra: new Date(meldekortId),
      til: new Date(meldekortId),
      kortKanSendesFra: new Date(meldekortId),
      kanKortSendes: true,
      periodeKode: ""
    },
    meldegruppe: Meldegruppe.DAGP,
    kortStatus: KortStatus.FERDI,
    bruttoBelop: 100,
    erForskuddsPeriode: false,
    mottattDato: new Date(meldekortId),
    korrigerbart: true
  }
}

export const opprettTestMeldekortdetaljer = (meldekortId: number): IMeldekortdetaljer => {
  return {
    id: meldekortId.toString(),
    meldekortId: meldekortId,
    meldeperiode: "",
    arkivnokkel: "",
    kortType: KortType.ELEKTRONISK,
    meldeDato: new Date(meldekortId),
    lestDato: new Date(meldekortId),
    sporsmal: {
      arbeidssoker: true,
      arbeidet: true,
      syk: true,
      annetFravaer: true,
      kurs: true,
      signatur: true,
      meldekortDager: []
    },
    begrunnelse: ""
  }
}
