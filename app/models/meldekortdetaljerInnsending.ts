import type { KortType } from "~/models/kortType";
import type { KortStatus } from "~/models/meldekort";
import type { Meldegruppe } from "~/models/meldegruppe";
import type { Jsonify } from "@remix-run/server-runtime/dist/jsonify";
import type { IMeldeperiode } from "~/models/meldeperiode";

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


export async function sendInnMeldekort(melekortApiUrl: string, meldekortdetaljer: IMeldekortdetaljerInnsending): Promise<Response> {
  const url = `${melekortApiUrl}/person/meldekort`; // Ja, URLen er litt rar her
  try {
    return await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(meldekortdetaljer)
    });
  } catch (err) {
    const response = new Response(null, { status: 500, statusText: (err as Error).message });

    return Promise.resolve(response)
  }
}
