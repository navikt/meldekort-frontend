export const sporsmalConfig: ISporsmalObj[] = [
  {
    id: "arbeidet",
    kategori: "arbeid",
    sporsmal: "sporsmal.arbeid",
    ja: "svar.arbeid.ja",
    nei: "svar.arbeid.nei",
    forklaring: "forklaring.sporsmal.arbeid",
    checked: undefined,
    feil: {
      erFeil: false,
      feilmeldingId: "arbeidet.required",
    }
  },
  {
    id: "kurs",
    kategori: "aktivitetArbeid",
    sporsmal: "sporsmal.aktivitetArbeid",
    ja: "svar.aktivitetArbeid.ja",
    nei: "svar.aktivitetArbeid.nei",
    forklaring: "forklaring.sporsmal.aktivitetArbeid",
    checked: undefined,
    feil: {
      erFeil: false,
      feilmeldingId: "kurs.required",
    }
  },
  {
    id: "syk",
    kategori: "forhindret",
    sporsmal: "sporsmal.forhindret",
    ja: "svar.forhindret.ja",
    nei: "svar.forhindret.nei",
    forklaring: "forklaring.sporsmal.forhindret",
    checked: undefined,
    feil: {
      erFeil: false,
      feilmeldingId: "syk.required",
    }
  },
  {
    id: "annetFravaer",
    kategori: "ferieFravar",
    sporsmal: "sporsmal.ferieFravar",
    ja: "svar.ferieFravar.ja",
    nei: "svar.ferieFravar.nei",
    forklaring: "forklaring.sporsmal.ferieFravar",
    checked: undefined,
    feil: {
      erFeil: false,
      feilmeldingId: "annetFravar.required",
    }
  },
  {
    id: "arbeidssoker",
    kategori: "registrert",
    sporsmal: "sporsmal.registrert",
    ja: "svar.registrert.ja",
    nei: "svar.registrert.nei",
    forklaring: "forklaring.sporsmal.registrert",
    checked: undefined,
    feil: {
      erFeil: false,
      feilmeldingId: "fortsetteRegistrert.required",
    }
  },
];

export interface ISporsmalObj {
  id: string;
  kategori: string;
  sporsmal: string;
  ja: string;
  nei: string;
  forklaring: string;
  checked: boolean | undefined;
  feil: {
    erFeil: boolean;
    feilmeldingId: string;
  }
}

export interface ISporsmalOgSvar {
  kategori: string;
  sporsmal: string;
  forklaring: string;
  svar: ISporsmal | undefined;
  formatertDato: string | undefined,
}

export interface ISporsmal {
  arbeidssoker: boolean;
  arbeidet: boolean;
  syk: boolean;
  annetFravaer: boolean;
  kurs: boolean;
  signatur: boolean;
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
