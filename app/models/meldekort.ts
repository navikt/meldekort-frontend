import { getEnv } from "~/utils/envUtils";
import type { KortType } from "~/models/kortType";

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

export interface IMeldeperiode {
  fra: Date;
  til: Date;
  kortKanSendesFra: Date;
  kanKortSendes: boolean;
  periodeKode: string;
}

export enum Meldegruppe {
  ATTF = "ATTF",
  DAGP = "DAGP",
  INDIV = "INDIV",
  ARBS = "ARBS",
  FY = "FY",
  NULL = "NULL"
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

export async function hentHistoriskeMeldekort(): Promise<Response> {
  const url = `${getEnv("MELDEKORT_API_URL")}/person/historiskemeldekort`;

  try {
    return await fetch(url, {
      method: "GET"
    });
  } catch (err) {
    const response = new Response(null, { status: 500, statusText: (err as Error).message });

    return Promise.resolve(response)
  }
}
