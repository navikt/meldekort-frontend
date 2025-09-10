import { DateTime } from "luxon";

import type { KortType } from "~/models/kortType";
import type { ISporsmal } from "~/models/sporsmal";
import { getEnv } from "~/utils/envUtils";
import { getHeaders } from "~/utils/fetchUtils";


export interface IMeldekortdetaljer {
  id: string;
  meldekortId: number;
  meldeperiode: string;
  arkivnokkel: string;
  kortType: KortType;
  meldeDato: DateTime;
  lestDato: DateTime;
  sporsmal: ISporsmal;
  begrunnelse: string | null;
}

export async function hentMeldekortdetaljer(onBehalfOfToken: string, meldekortId: string): Promise<Response> {
  const url = `${getEnv("MELDEKORT_API_URL")}/meldekort/${meldekortId}`;

  try {
    return await fetch(url, {
      method: "GET",
      headers: getHeaders(onBehalfOfToken),
    });
  } catch (err) {
    const response = new Response(null, { status: 500, statusText: (err as Error).message });

    return Promise.resolve(response);
  }
}
