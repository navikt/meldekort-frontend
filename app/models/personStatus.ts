import { getEnv } from "~/utils/envUtils";
import { getHeaders } from "~/utils/fetchUtils";
import type { TypedResponse } from "@remix-run/node";


export interface IPersonStatus {
  id: string;
  statusArbeidsoker: string | null;
  statusYtelse: string | null;
}

export async function hentPersonStatus(onBehalfOfToken: string): Promise<TypedResponse<IPersonStatus>> {
  const url = `${getEnv("MELDEKORT_API_URL")}/person/status`;

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
