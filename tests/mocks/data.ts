import { DateTime } from "luxon";

import type { IInfomelding } from "~/models/infomelding";
import { KortType } from "~/models/kortType";
import { Meldegruppe } from "~/models/meldegruppe";
import type { IMeldekort } from "~/models/meldekort";
import { KortStatus } from "~/models/meldekort";
import type { IMeldekortdetaljer } from "~/models/meldekortdetaljer";
import type { IValideringsResultat } from "~/models/meldekortdetaljerInnsending";
import type { IPerson, IPersonInfo } from "~/models/person";
import type { ISkrivemodus } from "~/models/skrivemodus";
import type { ISporsmal } from "~/models/sporsmal";

// Denne metoden gjør det samme som json() i loader (nå konverterer bare Date til String)
// Den oppretter ikke et nytt objekt, men gjør endringer i det gitte
export const jsonify = (data: object) => {
  for (const key in data) {
    // @ts-expect-error Det er helt OK å ha any her
    const value = data[key]
    if (value instanceof DateTime) {
      // @ts-expect-error Det er helt OK å ha any her
      data[key] = value.toISO();
    } else if (typeof value === "object") {
      jsonify(value);
    }
  }
};

// For å opprette testdata
export const opprettTestPerson = (
  meldekortId: number[],
  etterregistrerteMeldekortId: number[]
): IPerson => {
  return {
    meldekort: meldekortId.map((id) => opprettTestMeldekort(id)),
    etterregistrerteMeldekort: etterregistrerteMeldekortId.map((id) => opprettTestMeldekort(id)),
  };
};

export const opprettPersonInfo = (
  personId: number,
  fodselsnr: string,
  fornavn: string,
  etternavn: string
): IPersonInfo => {
  return {
    personId,
    fodselsnr,
    etternavn,
    fornavn,
  };
};

export const opprettTestMeldekort = (
  meldekortId: number,
  kanKortSendes: boolean = true,
  kortStatus: KortStatus = KortStatus.OPPRE,
  korrigerbart: boolean = true,
  kortType: KortType = KortType.ELEKTRONISK,
  meldegruppe: Meldegruppe = Meldegruppe.DAGP
): IMeldekort => {
  return {
    meldekortId: meldekortId,
    kortType: kortType,
    meldeperiode: {
      fra: DateTime.fromMillis(meldekortId * 1000).toISODate()!,
      til: DateTime.fromMillis(meldekortId * 1000 + 7 * 24 * 60 * 60).toISODate()!,
      kortKanSendesFra: DateTime.fromMillis(meldekortId * 1000).toISODate()!,
      kanKortSendes: kanKortSendes,
    },
    meldegruppe: meldegruppe,
    kortStatus: kortStatus,
    bruttoBelop: 100,
    mottattDato: DateTime.fromMillis(meldekortId * 1000),
    korrigerbart: korrigerbart,
  };
};

export const opprettTestMeldekortdetaljer = (meldekortId: number, begrunnelse: string | null = null): IMeldekortdetaljer => {
  return {
    id: meldekortId.toString(),
    meldekortId: meldekortId,
    meldeperiode: "",
    arkivnokkel: "",
    kortType: KortType.ELEKTRONISK,
    meldeDato: DateTime.fromMillis(meldekortId * 1000),
    lestDato: DateTime.fromMillis(meldekortId * 1000),
    sporsmal: {
      arbeidssoker: true,
      arbeidet: true,
      syk: true,
      annetFravaer: true,
      kurs: true,
      signatur: true,
      meldekortDager: [],
    },
    begrunnelse: begrunnelse,
  };
};

// Data
const meldekortId1 = 1707156945;
const meldekortId2 = 1707156946;
const meldekortId3 = 1707156947;
const meldekortId4 = 1707156948;
const meldekortId5 = 1707156949;
const meldekortId6 = 1707156950;

export const TEST_PERSON = opprettTestPerson(
  [meldekortId1, meldekortId2],
  [meldekortId3, meldekortId4]
);
export const TEST_PERSON_INFO = opprettPersonInfo(1, "01020312345", "Test", "Testesen");
export const TEST_HISTORISKEMELDEKORT = [
  opprettTestMeldekort(meldekortId5),
  opprettTestMeldekort(meldekortId6),
];
export const TEST_MELDEKORTDETALJER = opprettTestMeldekortdetaljer(meldekortId5);
export const TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK: IValideringsResultat = {
  meldekortId: 1,
  status: "OK",
  arsakskoder: null,
  meldekortdager: null,
};
export const TEST_MELDEKORT_VALIDERINGS_RESULTAT_FEIL: IValideringsResultat = {
  meldekortId: 1,
  status: "FEIL",
  arsakskoder: [
    {
      kode: "00",
      tekst: "Tekst 00",
      params: null,
    },
    {
      kode: "h01",
      tekst: "Tekst h01",
      params: null,
    },
  ],
  meldekortdager: null,
};
export const TEST_INFOMELDING: IInfomelding = {
  norsk: "Norsk infomelding",
  engelsk: "English infomessage",
};
export const TEST_SKRIVEMODUS: ISkrivemodus = {
  skrivemodus: true,
  melding: {
    norsk: "Norsk",
    engelsk: "English",
  },
};
export const TEST_DECORATOR_VERSION = {
  "localVersion":"678600c725d69f25c0da1f6f05f4c1eb4d3c56f9",
  "latestVersion":"678600c725d69f25c0da1f6f05f4c1eb4d3c56f9"
};
export const TEST_DECORATOR_RESPONSE = {
  "header": "<header id=\"decorator-header\">DECORATOR HEADER</header>",
  "footer": "<div id=\"decorator-footer\">DECORATOR FOOTER</div>",
  "scripts": "<script type=\"application/json\" id=\"__DECORATOR_DATA__\"></script>",
  "headAssets": "<link type=\"text/css\" rel=\"stylesheet\">",
  "versionId": "678600c725d69f25c0da1f6f05f4c1eb4d3c56f9",
};
export const TEST_DECORATOR_FRAGMENTS = {
  DECORATOR_HEAD_ASSETS: "",
  DECORATOR_SCRIPTS: "",
  DECORATOR_HEADER: "<div>DECORATOR HEADER</div>",
  DECORATOR_FOOTER: "<div>DECORATOR FOOTER</div>",
};
export const TEST_MELDEKORT_DAGER = [
  {
    dag: 1,
    arbeidetTimerSum: 5,
    syk: false,
    annetFravaer: false,
    kurs: false,
  },
  {
    dag: 2,
    arbeidetTimerSum: 0,
    syk: true,
    annetFravaer: false,
    kurs: false,
  },
  {
    dag: 3,
    arbeidetTimerSum: 0,
    syk: false,
    annetFravaer: true,
    kurs: false,
  },
  {
    dag: 4,
    arbeidetTimerSum: 0,
    syk: false,
    annetFravaer: false,
    kurs: true,
  },
  {
    dag: 5,
    arbeidetTimerSum: 0,
    syk: true,
    annetFravaer: false,
    kurs: true,
  },
  {
    dag: 6,
    arbeidetTimerSum: 0,
    syk: false,
    annetFravaer: false,
    kurs: false,
  },
  {
    dag: 7,
    arbeidetTimerSum: 0,
    syk: false,
    annetFravaer: false,
    kurs: false,
  },
  {
    dag: 8,
    arbeidetTimerSum: 7.5,
    syk: false,
    annetFravaer: false,
    kurs: false,
  },
];
export const TEST_SPORSMAL: ISporsmal = {
  arbeidssoker: true,
  arbeidet: true,
  syk: true,
  annetFravaer: false,
  kurs: true,
  signatur: true,
  meldekortDager: TEST_MELDEKORT_DAGER,
};
