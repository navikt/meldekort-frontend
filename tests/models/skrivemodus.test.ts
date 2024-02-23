import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { catchErrorResponse } from '../helpers/response-helper';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';
import { TEST_MELDEKORT_API_URL } from '../helpers/setup';
import { TEST_SKRIVEMODUS } from '../mocks/data';
import { hentSkrivemodus } from '~/models/skrivemodus';


// Kan ikke kjøres parallelt!
describe('Skrivemodus', () => {

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  test('hentSkrivemodus skal få status 500 når feil i backend', async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/skrivemodus`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    );

    const response = await catchErrorResponse(() => hentSkrivemodus(''));

    expect(response.status).toBe(500);
    expect(response.statusText).toBe('Internal Server Error');
  });

  test('hentSkrivemodus skal få data', async () => {
    const response = await hentSkrivemodus('');

    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toStrictEqual(TEST_SKRIVEMODUS);
  });

  test('hentSkrivemodus skal få status 500 når feil i fetch', async () => {
    // Stopper server slik at fetch kaster exception
    server.close();

    const response = await catchErrorResponse(() => hentSkrivemodus(''));

    expect(response.status).toBe(500);
    expect(response.statusText).toBe('fetch failed');
  });

  // OBS! Ikke skriv andre tester her videre hvis du trenger fungerende server, den er allerede stoppet
});
