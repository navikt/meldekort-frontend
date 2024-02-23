import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { catchErrorResponse } from '../helpers/response-helper';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';
import { TEST_MELDEKORT_API_URL } from '../helpers/setup';
import { TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK } from '../mocks/data';
import { sendInnMeldekortAction } from '~/models/meldekortdetaljerInnsending';
import type { ActionFunctionArgs, AppLoadContext } from '@remix-run/node';
import type { Params } from '@remix-run/router/utils';
import { Innsendingstype } from '~/models/innsendingstype';


// Kan ikke kjøres parallelt!
describe('Meldekortdetaljer Innsending', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  const opprettActionFunctionArgs = (innsendingstype: Innsendingstype = Innsendingstype.INNSENDING) => {
    const body = new FormData();
    body.append('meldekortdetaljer', '{ "meldekortId": "1708156951" }');
    body.append('innsendingstype', innsendingstype.toString());

    const request = new Request(
      'http://localhost',
      {
        method: 'POST',
        body
      }
    );
    const params: Params = {};
    const context: AppLoadContext = {};

    const actionFunctionArgs: ActionFunctionArgs = {
      request,
      params,
      context
    };

    return actionFunctionArgs;
  };

  test('sendInnMeldekortAction skal få baksystemFeil = true når feil ved henting en ny meldekortId ved Korrigering', async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/meldekort/1708156951/korrigering`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    );

    const response = await catchErrorResponse(() => sendInnMeldekortAction(opprettActionFunctionArgs(Innsendingstype.KORRIGERING)));

    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      baksystemFeil: true,
      innsending: null
    });
  });

  test('sendInnMeldekortAction skal få baksystemFeil = true når feil i backend', async () => {
    server.use(
      http.post(
        `${TEST_MELDEKORT_API_URL}/person/meldekort`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    );

    const response = await catchErrorResponse(() => sendInnMeldekortAction(opprettActionFunctionArgs()));

    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      baksystemFeil: true,
      innsending: null
    });
  });

  test('sendInnMeldekortAction skal få data', async () => {
    const response = await sendInnMeldekortAction(opprettActionFunctionArgs());

    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toStrictEqual({
      baksystemFeil: false,
      innsending: TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK
    });
  });

  test('sendInnMeldekortAction skal få data ved Korrigering', async () => {
    const response = await sendInnMeldekortAction(opprettActionFunctionArgs(Innsendingstype.KORRIGERING));

    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toStrictEqual({
      baksystemFeil: false,
      innsending: TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK
    });
  });

  test('sendInnMeldekortAction skal få baksystemFeil = true når feil i fetch', async () => {
    // Stopper server slik at fetch kaster exception
    server.close();

    const response = await catchErrorResponse(() => sendInnMeldekortAction(opprettActionFunctionArgs()));

    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      baksystemFeil: true,
      innsending: null
    });
  });

  // OBS! Ikke skriv andre tester her videre hvis du trenger fungerende server, den er allerede stoppet
});
