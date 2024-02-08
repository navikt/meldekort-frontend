import type { IMeldekort } from "~/models/meldekort";
import { KortStatus } from "~/models/meldekort";
import { KortType } from "~/models/kortType";
import { Meldegruppe } from "~/models/meldegruppe";
import type { IMeldekortdetaljer } from "~/models/meldekortdetaljer";
import type { IFravaer, IPerson, IPersonInfo } from "~/models/person";
import { MeldeForm } from "~/models/person";
import type { IValideringsResultat } from "~/models/meldekortdetaljerInnsending";
import type { ISkrivemodus } from "~/models/skrivemodus";


// Denne metoden gjør det samme som json() i loader (nå konvertere bare Date til String)
// Den oppretter ikke et nytt objekt, men gjør endringer i det gitte
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
export const opprettTestPerson = (meldekortId: number[], etterregistrerteMeldekortId: number[]): IPerson => {
  return {
    maalformkode: "maalformkode",
    meldeform: MeldeForm.ELEKTRONISK,
    meldekort: meldekortId.map(id => opprettTestMeldekort(id)),
    etterregistrerteMeldekort: etterregistrerteMeldekortId.map(id => opprettTestMeldekort(id)),
    fravaer: new Array<IFravaer>(),
    id: "1",
    antallGjenstaaendeFeriedager: 5
  }
}

export const opprettPersonInfo = (personId: number, fodselsnr: string, fornavn: string, etternavn: string): IPersonInfo => {
  return {
    personId,
    fodselsnr,
    etternavn,
    fornavn
  }
}

export const opprettTestMeldekort = (meldekortId: number, kanKortSendes: boolean = true): IMeldekort => {
  return {
    meldekortId: meldekortId,
    kortType: KortType.ELEKTRONISK,
    meldeperiode: {
      fra: new Date(meldekortId),
      til: new Date(meldekortId),
      kortKanSendesFra: new Date(meldekortId),
      kanKortSendes: kanKortSendes,
      periodeKode: ""
    },
    meldegruppe: Meldegruppe.DAGP,
    kortStatus: KortStatus.OPPRE,
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


// Data
const meldekortId1 = 1707156945
const meldekortId2 = 1707156946
const meldekortId3 = 1707156947
const meldekortId4 = 1707156948
const meldekortId5 = 1707156949
const meldekortId6 = 1707156950

export const TEST_PERSON = opprettTestPerson([meldekortId1, meldekortId2], [meldekortId3, meldekortId4])
export const TEST_PERSON_INFO = opprettPersonInfo(1, "01020312345", "Test", "Testesen")
export const TEST_HISTORISKEMELDEKORT = [opprettTestMeldekort(meldekortId5), opprettTestMeldekort(meldekortId6)]
export const TEST_MELDEKORTDETALJER = opprettTestMeldekortdetaljer(meldekortId5)
export const TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK: IValideringsResultat = {
  meldekortId: 1,
  status: "OK",
  arsakskoder: null,
  meldekortdager: null
}
export const TEST_MELDEKORT_VALIDERINGS_RESULTAT_FEIL: IValideringsResultat = {
  meldekortId: 1,
  status: "FEIL",
  arsakskoder: [
    {
      kode: "00",
      tekst: "Tekst 00",
      params: null
    },
    {
      kode: "h01",
      tekst: "Tekst h01",
      params: null
    }
  ],
  meldekortdager: null
}
export const TEST_SKRIVEMODUS: ISkrivemodus = {
  skrivemodus: true,
  melding: {
    norsk: "Norsk",
    engelsk: "English"
  }
}
