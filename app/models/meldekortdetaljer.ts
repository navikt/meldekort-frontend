import { getEnv } from "~/utils/envUtils";
import type { KortType } from "~/models/kortType";
import type { ISporsmal } from "~/models/sporsmal";

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
