import type { TypedResponse } from "@remix-run/node";

import type { IInfomelding } from "~/models/infomelding";
import { getEnv } from "~/utils/envUtils";
import { getHeaders } from "~/utils/fetchUtils";


export interface ISkrivemodus {
  skrivemodus: boolean;
  melding?: IInfomelding;
}

export async function hentSkrivemodus(onBehalfOfToken: string): Promise<TypedResponse<ISkrivemodus>> {
  const url = `${getEnv("MELDEKORT_API_URL")}/skrivemodus`;

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
