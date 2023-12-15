import { getEnv } from "~/utils/envUtils";
import type { KortType } from "~/models/kortType";

export interface IMeldekortdetaljer {
  id: string;
  meldekortId: number;
  meldeperiode: string;
  arkivnokkel: string;
  kortType: KortType;
  meldeDato: Date;
  lestDato: Date;
  sporsmal: ISporsmal;
  begrunnelse: string;
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

export async function hentMeldekortdetaljer(meldekortId: string): Promise<Response> {
  const url = `${getEnv("MELDEKORT_API_URL")}/meldekort/${meldekortId}`;

  try {
    return await fetch(url, {
      method: "GET"
    });
  } catch (err) {
    const response = new Response(null, { status: 500, statusText: (err as Error).message });

    return Promise.resolve(response)
  }
}
