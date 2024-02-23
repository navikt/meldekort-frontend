import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { catchErrorResponse } from '../helpers/response-helper';
import { hentHistoriskeMeldekort, hentMeldekortIdForKorrigering } from '~/models/meldekort';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';
import { TEST_MELDEKORT_API_URL } from '../helpers/setup';
import { jsonify, TEST_HISTORISKEMELDEKORT } from '../mocks/data';


// Kan ikke kjøres parallelt!
describe('Meldekort', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  test('hentHistoriskeMeldekort skal få status 500 når feil i backend', async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/historiskemeldekort`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    );

    const response = await catchErrorResponse(() => hentHistoriskeMeldekort(''));

    expect(response.status).toBe(500);
    expect(response.statusText).toBe('Internal Server Error');
  });

  test('hentHistoriskeMeldekort skal få data', async () => {
    const expectedData = [...TEST_HISTORISKEMELDEKORT]; // Clone
    jsonify(expectedData);

    const response = await hentHistoriskeMeldekort('');

    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toStrictEqual(expectedData);
  });

  test('hentMeldekortIdForKorrigering skal få status 500 når feil i backend', async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/meldekort/1708156951/korrigering`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    );

    const response = await catchErrorResponse(() => hentMeldekortIdForKorrigering('', '1708156951'));

    expect(response.status).toBe(500);
    expect(response.statusText).toBe('Internal Server Error');
  });

  test('hentMeldekortIdForKorrigering skal få data', async () => {
    const response = await hentMeldekortIdForKorrigering('', '1708156951');

    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toStrictEqual(1708156952);
  });

  test('hentHistoriskeMeldekort skal få status 500 når feil i fetch', async () => {
    // Stopper server slik at fetch kaster exception
    server.close();

    const response = await catchErrorResponse(() => hentHistoriskeMeldekort(''));

    expect(response.status).toBe(500);
    expect(response.statusText).toBe('fetch failed');
  });

  test('hentMeldekortIdForKorrigering skal få status 500 når feil i fetch', async () => {
    // Stopper server slik at fetch kaster exception
    server.close();

    const response = await catchErrorResponse(() => hentMeldekortIdForKorrigering('', '1708156951'));

    expect(response.status).toBe(500);
    expect(response.statusText).toBe('fetch failed');
  });

  // OBS! Ikke skriv andre tester her videre hvis du trenger fungerende server, den er allerede stoppet
});
