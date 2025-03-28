export async function hentHarAAP(onBehalfOfToken: string): Promise<Response> {
  const url = 'http://meldekort-backend.aap/api/ansvarlig-system-felles';

  try {
    return await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "text/plain",
        "Content-Type": "text/plain",
        "Authorization": `Bearer ${onBehalfOfToken}`
      },
    });
  } catch (err) {
    const response = new Response(null, { status: 500, statusText: (err as Error).message });

    return Promise.resolve(response);
  }
}
