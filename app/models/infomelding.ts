import type { TypedResponse } from "@remix-run/node";
import { getEnv } from "~/utils/envUtils";
import { getHeaders } from "~/utils/fetchUtils";


export interface IInfomelding {
  norsk: string;
  engelsk: string;
}

export async function hentInfomelding(onBehalfOfToken: string): Promise<TypedResponse<IInfomelding>> {
  const url = `${getEnv("MELDEKORT_API_URL")}/meldekort/infomelding`;

  try {
    return await fetch(url, {
      method: "GET",
      headers: getHeaders(onBehalfOfToken)
    });
  } catch (err) {
    const response = new Response(null, { status: 500, statusText: (err as Error).message });

    return Promise.resolve(response);
  }
}
