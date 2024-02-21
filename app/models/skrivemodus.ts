import { getEnv } from "~/utils/envUtils";
import { getHeaders } from "~/utils/fetchUtils";
import type { TypedResponse } from "@remix-run/node";


export interface ISkrivemodus {
  skrivemodus: boolean;
  melding: IInfomelding | null;
}

export interface IInfomelding {
  norsk: string;
  engelsk: string;
}

export async function hentSkrivemodus(onBehalfOfToken: string): Promise<TypedResponse<ISkrivemodus>> {
  const url = `${getEnv("MELDEKORT_API_URL")}/skrivemodus`;

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
