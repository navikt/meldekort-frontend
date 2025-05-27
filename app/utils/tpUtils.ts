import { getHeaders } from "~/utils/fetchUtils";

export interface ITPBruker {
  harSak: boolean;
}

export async function hentTpBruker(onBehalfOfToken: string): Promise<Response> {
  const url = "http://tiltakspenger-meldekort-api.tpts/brukerfrontend/bruker";

  try {
    return await fetch(url, {
      method: "GET",
      headers: getHeaders(onBehalfOfToken, "Authorization")
    });
  } catch (err) {
    const response = new Response(null, { status: 500, statusText: (err as Error).message });

    return Promise.resolve(response);
  }
}
