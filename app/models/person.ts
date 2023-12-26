import { getEnv } from "~/utils/envUtils";

export interface IPersonInfo {
  personId: number;
  fodselsnr: string;
  etternavn: string;
  fornavn: string;
}

export async function hentPersonInfo(): Promise<Response> {
  const url = `${getEnv("MELDEKORT_API_URL")}/person/info`;

  try {
    return await fetch(url, {
      method: "GET"
    });
  } catch (err) {
    const response = new Response(null, { status: 500, statusText: (err as Error).message });

    return Promise.resolve(response)
  }
}
