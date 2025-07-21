import type { IMeldekort } from "~/models/meldekort";
import { getEnv } from "~/utils/envUtils";
import { getHeaders } from "~/utils/fetchUtils";


export interface IPerson {
  meldekort: IMeldekort[];
  etterregistrerteMeldekort: IMeldekort[];
}

export interface IPersonInfo {
  personId: number;
  fodselsnr: string;
  etternavn: string;
  fornavn: string;
}

export async function hentPerson(onBehalfOfToken: string): Promise<Response> {
  const url = `${getEnv("MELDEKORT_API_URL")}/person/meldekort`; // Ja, URLen er litt rar her

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

export async function hentPersonInfo(onBehalfOfToken: string): Promise<Response> {
  const url = `${getEnv("MELDEKORT_API_URL")}/person/info`;

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
