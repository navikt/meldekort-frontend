export const sporsmalConfig: ISporsmalObj[] = [
  {
    id: "arbeidet",
    kategori: "arbeid",
    sporsmal: "sporsmal.arbeid",
    ja: "svar.arbeid.ja",
    nei: "svar.arbeid.nei",
    forklaring: "forklaring.sporsmal.arbeid",
    feilmeldingId: "arbeidet.required",
  },
  {
    id: "kurs",
    kategori: "aktivitetArbeid",
    sporsmal: "sporsmal.aktivitetArbeid",
    ja: "svar.aktivitetArbeid.ja",
    nei: "svar.aktivitetArbeid.nei",
    forklaring: "forklaring.sporsmal.aktivitetArbeid",
    feilmeldingId: "kurs.required",
  },
  {
    id: "syk",
    kategori: "forhindret",
    sporsmal: "sporsmal.forhindret",
    ja: "svar.forhindret.ja",
    nei: "svar.forhindret.nei",
    forklaring: "forklaring.sporsmal.forhindret",
    feilmeldingId: "syk.required",
  },
  {
    id: "annetFravaer",
    kategori: "ferieFravar",
    sporsmal: "sporsmal.ferieFravar",
    ja: "svar.ferieFravar.ja",
    nei: "svar.ferieFravar.nei",
    forklaring: "forklaring.sporsmal.ferieFravar",
    feilmeldingId: "annetFravar.required",
  },
  {
    id: "arbeidssoker",
    kategori: "registrert",
    sporsmal: "sporsmal.registrert",
    ja: "svar.registrert.ja",
    nei: "svar.registrert.nei",
    forklaring: "forklaring.sporsmal.registrert",
    feilmeldingId: "fortsetteRegistrert.required",
  },
];

export interface ISporsmalObj {
  id: string;
  kategori: string;
  sporsmal: string;
  ja: string;
  nei: string;
  forklaring: string;
  feilmeldingId: string;
}

export interface ISporsmalOgSvar {
  kategori: string;
  sporsmal: string;
  forklaring: string;
  svar: boolean | null;
  formatertDato: string | undefined,
}

export interface ISporsmal {
  arbeidssoker: boolean | null;
  arbeidet: boolean | null;
  syk: boolean | null;
  annetFravaer: boolean | null;
  kurs: boolean | null;
  signatur: boolean | null;
  meldekortDager: IMeldekortDag[];
}

export interface IMeldekortDag {
  dag: number;
  arbeidetTimerSum: number;
  syk: boolean;
  annetFravaer: boolean;
  kurs: boolean;
  meldegruppe?: string;
}
