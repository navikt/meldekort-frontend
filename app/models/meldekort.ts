import type { KortType } from "~/models/kortType";
import type { IMeldeperiode } from "~/models/meldeperiode";
import type { Meldegruppe } from "~/models/meldegruppe";
import { getEnv } from "~/utils/envUtils";
import { getHeaders } from "~/utils/fetchUtils";
import type { TypedResponse } from "@remix-run/node";


export interface IMeldekort {
  meldekortId: number;
  kortType: KortType;
  meldeperiode: IMeldeperiode;
  meldegruppe: Meldegruppe;
  kortStatus: KortStatus;
  bruttoBelop?: number;
  erForskuddsPeriode: boolean;
  mottattDato: Date;
  korrigerbart: boolean;
}

export enum KortStatus {
  OPPRE = "OPPRE",
  SENDT = "SENDT",
  SLETT = "SLETT",
  REGIS = "REGIS",
  FMOPP = "FMOPP",
  FUOPP = "FUOPP",
  KLAR = "KLAR",
  KAND = "KAND",
  IKKE = "IKKE",
  OVERM = "OVERM",
  NYKTR = "NYKTR",
  FERDI = "FERDI",
  FEIL = "FEIL",
  VENTE = "VENTE",
  OPPF = "OPPF",
  UBEHA = "UBEHA"
}

export async function hentHistoriskeMeldekort(onBehalfOfToken: string): Promise<TypedResponse<IMeldekort[]>> {
  const url = `${getEnv("MELDEKORT_API_URL")}/person/historiskemeldekort`;

  try {
    return await fetch(url, {
      method: "GET",
      headers: getHeaders(onBehalfOfToken)
    });
  } catch (err) {
    const response = new Response(null, { status: 500, statusText: (err as Error).message });

    return Promise.resolve(response)
  }
}

export async function hentMeldekortIdForKorrigering(onBehalfOfToken: string, meldekortId: string): Promise<TypedResponse<number>> {
  const url = `${getEnv("MELDEKORT_API_URL")}/meldekort/${meldekortId}/korrigering`;

  try {
    return await fetch(url, {
      method: "GET",
      headers: getHeaders(onBehalfOfToken)
    });
  } catch (err) {
    const response = new Response(null, { status: 500, statusText: (err as Error).message });

    return Promise.resolve(response)
  }
}
