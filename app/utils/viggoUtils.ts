import { getEnv } from '~/utils/envUtils';
import { getHeaders } from '~/utils/fetchUtils';


export async function hentErViggo(onBehalfOfToken: string): Promise<Response> {
  const url = `${getEnv('MELDEKORT_API_URL')}/viggo/erViggo`;

  try {
    return await fetch(url, {
      method: 'GET',
      headers: getHeaders(onBehalfOfToken)
    });
  } catch (err) {
    const response = new Response(null, { status: 500, statusText: (err as Error).message });

    return Promise.resolve(response);
  }
}
