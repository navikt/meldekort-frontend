import { getEnv } from "~/utils/envUtils";
import { getHeaders } from "~/utils/fetchUtils";


export async function hentHarDP(onBehalfOfToken: string): Promise<Response> {
  const url = `${getEnv("MELDEKORT_API_URL")}/hardp`;

  try {
    return await fetch(url, {
      method: "GET",
      headers: getHeaders(onBehalfOfToken),
      redirect: "manual", // Ellers skal fetch prøve å følge URL fra redirect, men meldekort-api returnerer ikke URL
    });
  } catch (err) {
    const response = new Response(null, { status: 500, statusText: (err as Error).message });

    return Promise.resolve(response);
  }
}
