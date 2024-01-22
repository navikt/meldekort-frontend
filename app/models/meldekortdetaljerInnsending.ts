import type { KortType } from "~/models/kortType";
import type { KortStatus } from "~/models/meldekort";
import type { Meldegruppe } from "~/models/meldegruppe";
import type { Jsonify } from "@remix-run/server-runtime/dist/jsonify";
import type { IMeldeperiode } from "~/models/meldeperiode";
import { getHeaders } from "~/utils/fetchUtils";

// Request
export interface IMeldekortdetaljerInnsending {
  meldekortId: number;
  kortType: KortType;
  kortStatus: KortStatus;
  meldegruppe: Meldegruppe,
  mottattDato: Date;
  meldeperiode: Jsonify<IMeldeperiode>;
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
export interface IValideringsResultat {
  meldekortId: number;
  status: string;
  arsakskoder: IArsakskode[] | null,
  meldekortdager: IMeldekortDag[] | null
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

export async function sendInnMeldekort(onBehalfOfToken: string, melekortApiUrl: string, meldekortdetaljer: IMeldekortdetaljerInnsending): Promise<Response> {
  const url = `${melekortApiUrl}/person/meldekort`; // Ja, URLen er litt rar her
  try {
    return await fetch(url, {
      method: "POST",
      headers: getHeaders(onBehalfOfToken),
      body: JSON.stringify(meldekortdetaljer)
    });
  } catch (err) {
    const response = new Response(null, { status: 500, statusText: (err as Error).message });

    return Promise.resolve(response)
  }
}
