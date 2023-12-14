import { getEnv } from "~/utils/envUtils";

export interface ISkrivemodus {
  skrivemodus: boolean;
  melding: IInfomelding | null;
}

export interface IInfomelding {
  norsk: string;
  engelsk: string;
}

export async function hentSkrivemodus(): Promise<Response> {
  const url = `${getEnv("MELDEKORT_API_URL")}/skrivemodus`;

  try {
    return await fetch(url, {
      method: "GET"
    });
  } catch (err) {
    const response = new Response(null, { status: 500, statusText: (err as Error).message });

    return Promise.resolve(response)
  }
}
