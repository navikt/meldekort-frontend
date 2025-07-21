import type { KortType } from "~/models/kortType";
import type { Meldegruppe } from "~/models/meldegruppe";
import type { KortStatus } from "~/models/meldekort";
import type { IMeldeperiode } from "~/models/meldeperiode";


// Request
export interface IMeldekortdetaljerInnsending {
  meldekortId: number;
  kortType: KortType;
  kortStatus: KortStatus;
  meldegruppe: Meldegruppe,
  mottattDato: Date;
  meldeperiode: IMeldeperiode;
  erArbeidssokerNestePeriode: boolean;
  bruttoBelop?: number;
  fravaersdager: IFravaerInnsending[];
  korrigerbart: boolean;
  begrunnelse: string;
  signatur: boolean;
  sesjonsId: string;
  sporsmalsobjekter: ISporsmalsobjekt[];
}

export interface IFravaerInnsending {
  dagIndeks: number;
  type: {
    typeFravaer: FravaerTypeInnsending;
  };
  arbeidTimer?: number;
}

export enum FravaerTypeInnsending {
  KURS_UTDANNING = "K",
  SYKDOM = "S",
  ANNET_FRAVAER = "X",
  ARBEIDS_FRAVAER = "A"
}

export interface ISporsmalsobjekt {
  advarsel?: string;
  sporsmal: string;
  forklaring?: string;
  svar?: string;
}

// Response
export interface ISendInnMeldekortActionResponse {
  baksystemFeil: boolean;
  innsending: IValideringsResultat | null;
}

export interface IValideringsResultat {
  meldekortId: number;
  status: string;
  arsakskoder: IArsakskode[] | null;
  meldekortdager: IMeldekortDag[] | null;
}

export interface IArsakskode {
  kode: string;
  tekst: string;
  params: string[] | null;
}

export interface IMeldekortDag {
  dag: number;
  arbeidetTimerSum: number | null;
  syk: boolean | null;
  annetFravaer: boolean | null;
  kurs: boolean | null;
  meldegruppe: string | null;
}
